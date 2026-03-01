import { RunService } from "@rbxts/services";
import { Log } from "./Utils/LogUtil";

export type RobloxConnection = {
	Connected: boolean;
	Disconnect(): void;
};
export type CustomConnection = {
	Connected: boolean;
	Disconnect(): void;
};
export type Connection = RBXScriptConnection | RobloxConnection | CustomConnection;

export type RobloxSignal<T extends unknown[]> = {
	Connect(callback: (...args: T) => void): RBXScriptConnection;
	Once(callback: (...args: T) => void): RBXScriptConnection;
	Wait(): T;
};
export type CustomSignal<T extends unknown[]> = {
	Connect(callback: (...args: T) => void): CustomConnection;
};
export type AnySignal<T extends unknown[]> = RBXScriptSignal | RobloxSignal<T> | CustomSignal<T>;

export type Destroyable = { Destroy(): void };
export type Disconnectable = { Disconnect(): void };
export type Cleanable = Instance | thread | Connection | Destroyable | Disconnectable | Promise<unknown> | (() => void);

export type CleanupType = "Destroy" | "destroy" | "Disconnect" | "disconnect";
export type CleanupFunction<T = Cleanable> = (resource: T) => void;
export type CleanupStrategy<T = Cleanable> = CleanupFunction<T> | CleanupType;

export type VaultConfig = {
	SAFE_MODE: boolean;
	DEBUG_MODE: boolean;
};

type FunctionConstructor<T, A extends unknown[]> = (...args: A) => T;
type NewableConstructor<T, A extends unknown[]> = {
	new (...args: A): T;
};
type Constructor<T, A extends unknown[]> = FunctionConstructor<T, A> | NewableConstructor<T, A>;

export type VaultDefer = {
	Add: (object: Cleanable, cleanup?: CleanupStrategy<Cleanable>) => Cleanable;
};

type EntryMetadata = {
	cleanup: CleanupFunction;
	token: number;
	timestamp?: number;
};

type InternalState = {
	entries: Map<unknown, EntryMetadata>;
	tokens: Map<number, unknown>;
	nextToken: number;
	entryCount: number;
	children: Descriptor[];
	parent?: Descriptor;
	cleaned: boolean;
	name?: string;
	createdAt: number;
};

export type VaultDeferCallback = (scope: VaultDefer) => Cleanable | void;

export interface Descriptor {
	Add<T extends Cleanable>(object: T, cleanup?: CleanupStrategy<Cleanable>): T;
	Remove(objectOrToken: Cleanable | number): boolean;

	Clean(): void;
	Destroy(): void;

	Connect<T extends unknown[]>(signal: AnySignal<T>, callback: (...args: T) => void): Connection;
	Once<T extends unknown[]>(signal: AnySignal<T>, callback: (...args: T) => void): Connection;

	BindToRenderStep(name: string, priority: number, callback: (deltaTime: number) => void): Descriptor;
	BindToHeartbeat(callback: (deltaTime: number) => void): Descriptor;
	BindToStepped(callback: (deltaTime: number, alpha: number) => void): Descriptor;

	AttachToInstance(instance: Instance): Connection;
	Construct<T, A extends unknown[]>(constructClass: Constructor<T, A>, ...args: A): T;
	Extend(name?: string): Descriptor;
	Import(otherVault: Descriptor): Descriptor;
	Clone<T>(instance: T & Instance): T & Instance;
	Defer(callback: VaultDeferCallback): Cleanable | undefined;
	DeferAsync<T>(callback: (scope: VaultDefer) => Promise<T>): Promise<T | undefined>;

	Contains(object: unknown): boolean;
	Size(): number;
	IsCleaned(): boolean;

	GetName(): string | undefined;
	GetEntries(): ReadonlyArray<Cleanable>;
	GetChildren(): Descriptor[];
	GetParent(): Descriptor | undefined;

	_state: InternalState;
}

const DEFAULT_VAULT_CONFIG: Readonly<VaultConfig> = {
	SAFE_MODE: false,
	DEBUG_MODE: false,
};

const ACTIVE_VAULT_CONFIG: VaultConfig = {
	SAFE_MODE: DEFAULT_VAULT_CONFIG.SAFE_MODE,
	DEBUG_MODE: DEFAULT_VAULT_CONFIG.DEBUG_MODE,
};
const CLEANUP_CACHE = new Map<string, CleanupFunction<Cleanable>>();

function cleanableExecutor(cleanable: CleanupFunction, object: unknown) {
	if (ACTIVE_VAULT_CONFIG.SAFE_MODE) {
		const [success, message] = pcall(() => cleanable(object as never));
		if (!success) {
			Log("error", `Attempted to cleanup ${object} which is an unsupported object because ${message}`);
		}
	} else {
		cleanable(object as never);
	}
}

function verifyCleanableType(method: CleanupType): CleanupFunction {
	return (object: unknown) => {
		if (typeIs(object, "table") || typeIs(object, "userdata")) {
			const objectAsTable = object as Record<string | number | symbol, unknown>;
			if (objectAsTable[method] !== undefined) {
				const callback = objectAsTable[method];
				if (typeIs(callback, "function")) {
					callback();
				}
			}
		}
	};
}

function isPromise(value: unknown): value is Promise<unknown> {
	if (!typeIs(value, "table")) return false;

	const validPromise = value as Record<string, unknown>;

	return (
		typeIs(validPromise.then, "function") &&
		typeIs(validPromise.catch, "function") &&
		typeIs(validPromise.finally, "function")
	);
}

function verifyCleanableForObject(object: Cleanable, custom?: CleanupStrategy): CleanupFunction<Cleanable> {
	if (custom) {
		return typeIs(custom, "function") ? custom : verifyCleanableType(custom);
	}

	const luauType = typeOf(object);

	const cachedCleanable = CLEANUP_CACHE.get(luauType);
	if (cachedCleanable) return cachedCleanable;

	let cleanup: CleanupFunction<Cleanable> | undefined;

	if (luauType === "Instance") {
		cleanup = (luauObject: Cleanable) => {
			const instantiate = luauObject as Instance;
			if (instantiate.Parent) instantiate.Destroy();
		};
	} else if (luauType === "RBXScriptConnection") {
		cleanup = (luauObject: Cleanable) => {
			const connect = luauObject as RBXScriptConnection;
			if (connect.Connected) connect.Disconnect();
		};
	} else if (luauType === "thread") {
		cleanup = (luauObject: Cleanable) => task.cancel(luauObject as thread);
	} else if (luauType === "function") {
		cleanup = (luauObject: Cleanable) => task.spawn(luauObject as () => void);
	} else if (isPromise(object)) {
		cleanup = (luauObject: Cleanable) => {
			const promise = luauObject as Promise<unknown>;
			const promiseMethod = promise as unknown as { cancel?: () => void };
			if (typeIs(promiseMethod.cancel, "function")) {
				promiseMethod.cancel();
			}
		};
	} else if (typeIs(object, "table")) {
		const tableObject = object as Record<string, unknown>;
		if ("Destroy" in tableObject && typeIs(tableObject["Destroy"], "function")) {
			cleanup = (luauObject: Cleanable) => {
				const destroyable = (luauObject as Record<string, unknown>)["Destroy"];
				if (typeIs(destroyable, "function")) (destroyable as () => void)();
			};
		} else if ("Disconnect" in tableObject && typeIs(tableObject["Disconnect"], "function")) {
			cleanup = (luauObject: Cleanable) => {
				const disconnectable = (luauObject as Record<string, unknown>)["Disconnect"];
				if (typeIs(disconnectable, "function")) (disconnectable as () => void)();
			};
		}
	}

	if (!cleanup) {
		Log("error", `No cleanup method found for ${luauType}`, 2);
		cleanup = () => {};
	}

	if (luauType !== "table") {
		CLEANUP_CACHE.set(luauType, cleanup);
	}

	return cleanup;
}

function connectSignal<T extends unknown[]>(signal: AnySignal<T>, callback: (...args: T) => void): Connection {
	if ("ConnectParallel" in signal) {
		return signal.Connect(callback);
	}

	if ("Connect" in signal && typeIs(signal.Connect, "function")) {
		if ("Once" in signal) {
			return signal.Connect(callback);
		} else {
			return signal.Connect(callback);
		}
	}

	error(`Unsupported signal type ${typeOf(signal)}`, 2);
}

export function ConfigureVault(config: Partial<VaultConfig>): void {
	if ("SAFE_MODE" in config && typeIs(config.SAFE_MODE, "boolean")) {
		ACTIVE_VAULT_CONFIG.SAFE_MODE = config.SAFE_MODE;
	}
	if ("DEBUG_MODE" in config && typeIs(config.DEBUG_MODE, "boolean")) {
		ACTIVE_VAULT_CONFIG.DEBUG_MODE = config.DEBUG_MODE;
	}
}

export function GetVaultConfig(): Readonly<VaultConfig> {
	return table.freeze({
		SAFE_MODE: ACTIVE_VAULT_CONFIG.SAFE_MODE,
		DEBUG_MODE: ACTIVE_VAULT_CONFIG.DEBUG_MODE,
	});
}

export class Vault implements Descriptor {
	_state: InternalState;

	constructor(name?: string) {
		this._state = {
			entries: new Map(),
			tokens: new Map(),
			entryCount: 0,
			nextToken: 0,
			children: [],
			cleaned: false,
			name,
			createdAt: os.clock(),
		};
	}

	Add<T extends Cleanable>(object: T, cleanup?: CleanupStrategy<Cleanable>): T {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned Add`, 3);
		}

		if (this._state.entries.has(object)) return object;

		const token = ++this._state.nextToken;
		const callback = verifyCleanableForObject(object, cleanup);

		this._state.entries.set(object, {
			cleanup: callback,
			token,
			timestamp: ACTIVE_VAULT_CONFIG.DEBUG_MODE ? os.clock() : undefined,
		});

		this._state.tokens.set(token, object);
		this._state.entryCount++;

		return object;
	}

	Remove(objectOrToken: Cleanable | number): boolean {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned Remove`, 3);
		}

		const object = typeIs(objectOrToken, "number")
			? this._state.tokens.has(objectOrToken)
				? this._state.tokens.get(objectOrToken)
				: undefined
			: objectOrToken;

		if (object === undefined) return false;

		const entry = this._state.entries.get(object);
		if (entry === undefined) return false;

		this._state.entries.delete(object);
		this._state.tokens.delete(entry.token);
		this._state.entryCount--;

		cleanableExecutor(entry.cleanup, object);

		return true;
	}

	Clean(): void {
		if (this._state.cleaned) return;
		this._state.cleaned = true;

		for (const child of this._state.children) {
			child.Clean();
		}

		for (const [object, entry] of this._state.entries) {
			cleanableExecutor(entry.cleanup, object);
		}

		this._state.entries.clear();
		this._state.tokens.clear();
		this._state.children.clear();

		this._state.entryCount = 0;
		this._state.nextToken = 0;

		if (this._state.parent) {
			const siblings = this._state.parent._state.children;
			const index = siblings.indexOf(this as Descriptor);
			if (index >= 0) siblings.remove(index);
		}
	}

	Destroy(): void {
		this.Clean();
	}

	Connect<T extends unknown[]>(signal: AnySignal<T>, callback: (...args: T) => void): Connection {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned Connect`, 3);
		}

		const connection = connectSignal(signal, callback);
		this.Add(connection);
		return connection;
	}

	Once<T extends unknown[]>(signal: AnySignal<T>, callback: (...args: T) => void): Connection {
		if (this.IsCleaned()) {
			Log("error", "Already cleaned Once", 3);
		}

		const connection = connectSignal(signal, (...args: T) => {
			this.Remove(connection);
			callback(...args);
		});

		this.Add(connection);
		return connection;
	}

	BindToRenderStep(name: string, priority: number, callback: (deltaTime: number) => void): Descriptor {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned BindToRenderStep`, 3);
		}

		RunService.BindToRenderStep(name, priority, callback);
		this.Add(function () {
			RunService.UnbindFromRenderStep(name);
		});

		return this;
	}

	BindToHeartbeat(callback: (deltaTime: number) => void): Descriptor {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned BindToHeartbeat`, 3);
		}

		const connection = RunService.Heartbeat.Connect(callback);
		this.Add(connection);

		return this;
	}

	BindToStepped(callback: (deltaTime: number, alpha: number) => void): Descriptor {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned BindToStepped`, 3);
		}

		const thisConnection = RunService.Stepped.Connect(function (steppedTime: number, deltaTime: number) {
			callback(deltaTime, steppedTime);
		});
		this.Add(thisConnection);

		return this;
	}

	AttachToInstance(instance: Instance): Connection {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned AttachToInstance`, 3);
		}

		return this.Connect(instance.Destroying, () => this.Clean());
	}

	Construct<T, A extends unknown[]>(classOrConstructor: Constructor<T, A>, ...args: A): T {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned Construct`, 3);
		}

		let result: T;

		if (typeIs(classOrConstructor, "function")) {
			result = classOrConstructor(...args);
		} else {
			result = new classOrConstructor(...args);
		}

		this.Add(result as unknown as Cleanable);

		return result;
	}

	Extend(name?: string): Descriptor {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned Extend`, 3);
		}

		const child = new Vault(name);
		child._state.parent = this;
		this._state.children.push(child);

		return child;
	}

	Import(otherVault: Descriptor): Descriptor {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned Import`, 3);
		}

		this.Add(() => otherVault.Clean());

		return this;
	}

	Clone<T>(instance: Instance & T): Instance & T {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned Clone`, 3);
		}

		const clonable = instance.Clone();
		this.Add(clonable);

		return clonable;
	}

	Defer(callback: VaultDeferCallback): Cleanable | undefined {
		if (this.IsCleaned()) {
			Log("error", `Already cleaned Defer`, 3);
		}

		const vaultScope = this.Extend("DeferredScope");

		const [success, result] = pcall(callback, {
			Add: (object: Cleanable, cleanup?: CleanupStrategy<Cleanable>) => {
				return vaultScope.Add(object, cleanup);
			},
		});

		vaultScope.Clean();

		if (!success) {
			const message = typeIs(result, "string") ? result : tostring(result);
			Log("error", message, 2);
			return undefined;
		}

		return result === undefined ? undefined : result;
	}

	DeferAsync<T>(callback: (scope: VaultDefer) => Promise<T>): Promise<T | undefined> {
		if (this.IsCleaned()) {
			Log("error", "Already cleaned DeferAsync", 3);
			return Promise.resolve(undefined);
		}

		const vaultScope = this.Extend("DeferredAsyncScope");

		const state = {
			active: 0,
			closed: false,
		};

		const tryClean = () => {
			if (state.closed && state.active === 0) {
				vaultScope.Clean();
			}
		};

		const track = <U>(promise: Promise<U>): Promise<U> => {
			state.active++;

			return new Promise<U>((resolve, reject) => {
				promise
					.then(resolve)
					.catch(reject)
					.finally(() => {
						state.active--;
						tryClean();
					});
			});
		};

		const scope: VaultDefer = {
			Add: (object, cleanup) => vaultScope.Add(object, cleanup),
		};

		const [success, result] = pcall(() => callback(scope));
		if (!success) {
			state.closed = true;
			tryClean();

			const message = typeIs(result, "string") ? result : tostring(result);
			Log("error", message, 2);
			return Promise.resolve(undefined);
		}

		const rootPromise = track(result as Promise<T>);

		return rootPromise
			.then((value) => {
				state.closed = true;
				tryClean();
				return value;
			})
			.catch((issue) => {
				state.closed = true;
				tryClean();

				const message = typeIs(issue, "string") ? issue : tostring(issue);
				Log("error", message, 2);
				return undefined;
			});
	}

	Contains(object: unknown): boolean {
		return this._state.entries.has(object);
	}

	Size(): number {
		return this._state.entryCount;
	}

	IsCleaned(): boolean {
		return this._state.cleaned;
	}

	GetName(): string | undefined {
		return this._state.name;
	}

	GetEntries(): ReadonlyArray<Cleanable> {
		const entries: Cleanable[] = [];
		for (const [key] of this._state.entries) {
			entries.push(key as Cleanable);
		}
		return entries;
	}

	GetChildren(): Descriptor[] {
		return table.clone(this._state.children);
	}

	GetParent(): Descriptor | undefined {
		return this._state.parent;
	}
}
