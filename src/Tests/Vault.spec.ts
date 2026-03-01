/// <reference types="@rbxts/testez/globals" />

import { Vault, ConfigureVault, GetVaultConfig, Cleanable } from "index";

export = () => {
	describe("Constructor", () => {
		it("should create a Vault with a name", () => {
			const vault = new Vault("TestVault");
			expect(vault.GetName()).to.equal("TestVault");
			vault.Clean();
		});

		it("should create a Vault without a name", () => {
			const vault = new Vault();
			expect(vault.GetName()).to.equal(undefined);
			vault.Clean();
		});

		it("should start with zero entries", () => {
			const vault = new Vault();
			expect(vault.Size()).to.equal(0);
			vault.Clean();
		});

		it("should start as not cleaned", () => {
			const vault = new Vault();
			expect(vault.IsCleaned()).to.equal(false);
			vault.Clean();
		});

		it("should start with no children", () => {
			const vault = new Vault();
			expect(vault.GetChildren().size()).to.equal(0);
			vault.Clean();
		});

		it("should start with no parent", () => {
			const vault = new Vault();
			expect(vault.GetParent()).to.equal(undefined);
			vault.Clean();
		});
	});

	describe("Add", () => {
		let vault: Vault;

		beforeEach(() => {
			vault = new Vault("AddTest");
		});

		afterEach(() => {
			if (!vault.IsCleaned()) vault.Clean();
		});

		it("should add an Instance", () => {
			const part = new Instance("Part");
			vault.Add(part);
			expect(vault.Size()).to.equal(1);
			expect(vault.Contains(part)).to.equal(true);
		});

		it("should return the same object that was added", () => {
			const part = new Instance("Part");
			const returned = vault.Add(part);
			expect(returned).to.equal(part);
		});

		it("should add a function as cleanup callback", () => {
			let called = false;
			const fn = () => {
				called = true;
			};
			vault.Add(fn);
			expect(vault.Size()).to.equal(1);
			expect(vault.Contains(fn)).to.equal(true);
			vault.Clean();
			expect(called).to.equal(true);
		});

		it("should add a table with Destroy method", () => {
			let destroyed = false;
			const destroyable = {
				Destroy() {
					destroyed = true;
				},
			};
			vault.Add(destroyable);
			expect(vault.Size()).to.equal(1);
			vault.Clean();
			expect(destroyed).to.equal(true);
		});

		it("should add a table with Disconnect method", () => {
			let disconnected = false;
			const disconnectable = {
				Disconnect() {
					disconnected = true;
				},
			};
			vault.Add(disconnectable);
			expect(vault.Size()).to.equal(1);
			vault.Clean();
			expect(disconnected).to.equal(true);
		});

		it("should not duplicate an already-added object", () => {
			const part = new Instance("Part");
			vault.Add(part);
			vault.Add(part);
			expect(vault.Size()).to.equal(1);
		});

		it("should add multiple different objects", () => {
			const partA = new Instance("Part");
			const partB = new Instance("Part");
			vault.Add(partA);
			vault.Add(partB);
			expect(vault.Size()).to.equal(2);
		});

		it("should accept a custom cleanup strategy as string", () => {
			let destroyed = false;
			const obj = {
				Destroy() {
					destroyed = true;
				},
			};
			vault.Add(obj, "Destroy");
			vault.Clean();
			expect(destroyed).to.equal(true);
		});

		it("should accept a custom cleanup function", () => {
			let customCleaned = false;
			const part = new Instance("Part");
			vault.Add(part, () => {
				customCleaned = true;
			});
			vault.Clean();
			expect(customCleaned).to.equal(true);
		});

		it("should add an RBXScriptConnection", () => {
			const bindable = new Instance("BindableEvent");
			const connection = bindable.Event.Connect(() => {});
			vault.Add(connection);
			expect(vault.Size()).to.equal(1);
			expect(connection.Connected).to.equal(true);
			vault.Clean();
			expect(connection.Connected).to.equal(false);
			bindable.Destroy();
		});

		it("should add a thread", () => {
			const thread = task.delay(9999, () => {});
			vault.Add(thread);
			expect(vault.Size()).to.equal(1);
			expect(vault.Contains(thread)).to.equal(true);
		});
	});

	describe("Remove", () => {
		let vault: Vault;

		beforeEach(() => {
			vault = new Vault("RemoveTest");
		});

		afterEach(() => {
			if (!vault.IsCleaned()) vault.Clean();
		});

		it("should remove an object and return true", () => {
			const part = new Instance("Part");
			vault.Add(part);
			expect(vault.Size()).to.equal(1);

			const removed = vault.Remove(part);
			expect(removed).to.equal(true);
			expect(vault.Size()).to.equal(0);
			expect(vault.Contains(part)).to.equal(false);
		});

		it("should return false for a non-existent object", () => {
			const part = new Instance("Part");
			const removed = vault.Remove(part);
			expect(removed).to.equal(false);
		});

		it("should return false for a non-existent token", () => {
			const removed = vault.Remove(999999);
			expect(removed).to.equal(false);
		});

		it("should execute cleanup when removing", () => {
			let cleaned = false;
			const fn = () => {
				cleaned = true;
			};
			vault.Add(fn);
			vault.Remove(fn);
			expect(cleaned).to.equal(true);
		});

		it("should disconnect an RBXScriptConnection on remove", () => {
			const bindable = new Instance("BindableEvent");
			const connection = bindable.Event.Connect(() => {});
			vault.Add(connection);
			vault.Remove(connection);
			expect(connection.Connected).to.equal(false);
			bindable.Destroy();
		});

		it("should decrement size after removal", () => {
			const partA = new Instance("Part");
			const partB = new Instance("Part");
			vault.Add(partA);
			vault.Add(partB);
			expect(vault.Size()).to.equal(2);
			vault.Remove(partA);
			expect(vault.Size()).to.equal(1);
		});
	});

	describe("Clean", () => {
		it("should mark the vault as cleaned", () => {
			const vault = new Vault();
			vault.Clean();
			expect(vault.IsCleaned()).to.equal(true);
		});

		it("should clean all instances", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			part.Parent = game.GetService("Workspace");
			vault.Add(part);
			vault.Clean();
			expect(part.Parent).to.equal(undefined);
		});

		it("should call all function cleanups", () => {
			const vault = new Vault();
			let count = 0;
			vault.Add(() => count++);
			vault.Add(() => count++);
			vault.Add(() => count++);
			vault.Clean();
			expect(count).to.equal(3);
		});

		it("should disconnect all RBXScriptConnections", () => {
			const vault = new Vault();
			const bindable = new Instance("BindableEvent");
			const conn1 = bindable.Event.Connect(() => {});
			const conn2 = bindable.Event.Connect(() => {});
			vault.Add(conn1);
			vault.Add(conn2);
			vault.Clean();
			expect(conn1.Connected).to.equal(false);
			expect(conn2.Connected).to.equal(false);
			bindable.Destroy();
		});

		it("should reset size to 0 after clean", () => {
			const vault = new Vault();
			vault.Add(new Instance("Part"));
			vault.Add(new Instance("Part"));
			expect(vault.Size()).to.equal(2);
			vault.Clean();
			expect(vault.Size()).to.equal(0);
		});

		it("should be idempotent (double clean does nothing)", () => {
			const vault = new Vault();
			let count = 0;
			vault.Add(() => count++);
			vault.Clean();
			vault.Clean();
			expect(count).to.equal(1);
		});

		it("should clean children recursively", () => {
			const parent = new Vault("Parent");
			const child = parent.Extend("Child");

			let childCleaned = false;
			child.Add(() => {
				childCleaned = true;
			});

			parent.Clean();
			expect(childCleaned).to.equal(true);
			expect(child.IsCleaned()).to.equal(true);
		});

		it("should clear entries map after clean", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			vault.Add(part);
			vault.Clean();
			expect(vault.GetEntries().size()).to.equal(0);
		});
	});

	describe("Destroy", () => {
		it("should behave identically to Clean", () => {
			const vault = new Vault();
			let cleaned = false;
			vault.Add(() => {
				cleaned = true;
			});
			vault.Destroy();
			expect(cleaned).to.equal(true);
			expect(vault.IsCleaned()).to.equal(true);
		});
	});

	describe("Connect", () => {
		it("should connect to a signal and add the connection", () => {
			const vault = new Vault();
			const bindable = new Instance("BindableEvent");

			const connection = vault.Connect(bindable.Event, () => {});
			expect(vault.Size()).to.equal(1);
			expect(vault.Contains(connection)).to.equal(true);

			vault.Clean();
			bindable.Destroy();
		});

		it("should disconnect the connection when vault is cleaned", () => {
			const vault = new Vault();
			const bindable = new Instance("BindableEvent");

			const connection = vault.Connect(bindable.Event, () => {});
			expect(connection.Connected).to.equal(true);

			vault.Clean();
			expect(connection.Connected).to.equal(false);
			bindable.Destroy();
		});

		it("should work with BindableEvents", () => {
			const vault = new Vault();
			const bindable = new Instance("BindableEvent");

			const connection = vault.Connect(bindable.Event, () => {});
			expect(vault.Size()).to.equal(1);
			expect(connection.Connected).to.equal(true);

			vault.Clean();
			bindable.Destroy();
		});
	});

	describe("Once", () => {
		it("should connect to a signal and add the connection", () => {
			const vault = new Vault();
			const bindable = new Instance("BindableEvent");

			const connection = vault.Once(bindable.Event, () => {});
			expect(vault.Size()).to.equal(1);
			expect(vault.Contains(connection)).to.equal(true);

			vault.Clean();
			bindable.Destroy();
		});

		it("should be cleaned up if vault cleans before signal fires", () => {
			const vault = new Vault();
			const bindable = new Instance("BindableEvent");

			let fired = false;
			vault.Once(bindable.Event, () => {
				fired = true;
			});
			vault.Clean();

			bindable.Fire();
			task.wait();
			expect(fired).to.equal(false);
			bindable.Destroy();
		});
	});

	describe("BindToHeartbeat", () => {
		it("should return the vault instance for chaining", () => {
			const vault = new Vault();
			const result = vault.BindToHeartbeat(() => {});
			expect(result).to.equal(vault);
			vault.Clean();
		});

		it("should add the heartbeat connection to the vault", () => {
			const vault = new Vault();
			vault.BindToHeartbeat(() => {});
			expect(vault.Size()).to.equal(1);
			vault.Clean();
		});

		it("should fire the callback on heartbeat", () => {
			const vault = new Vault();
			let called = false;
			vault.BindToHeartbeat(() => {
				called = true;
			});
			task.wait();
			expect(called).to.equal(true);
			vault.Clean();
		});

		it("should stop firing after vault is cleaned", () => {
			const vault = new Vault();
			let count = 0;
			vault.BindToHeartbeat(() => {
				count++;
			});
			task.wait();
			vault.Clean();
			const countAfterClean = count;
			task.wait();
			expect(count).to.equal(countAfterClean);
		});
	});

	describe("BindToRenderStep", () => {
		it("should return the vault instance for chaining", () => {
			const vault = new Vault();
			const result = vault.BindToRenderStep("TestRender", Enum.RenderPriority.Camera.Value, () => {});
			expect(result).to.equal(vault);
			vault.Clean();
		});

		it("should add a cleanup function to the vault", () => {
			const vault = new Vault();
			vault.BindToRenderStep("TestRender2", Enum.RenderPriority.Camera.Value, () => {});
			expect(vault.Size()).to.equal(1);
			vault.Clean();
		});
	});

	describe("BindToStepped", () => {
		it("should return the vault instance for chaining", () => {
			const vault = new Vault();
			const result = vault.BindToStepped(() => {});
			expect(result).to.equal(vault);
			vault.Clean();
		});

		it("should add the stepped connection to the vault", () => {
			const vault = new Vault();
			vault.BindToStepped(() => {});
			expect(vault.Size()).to.equal(1);
			vault.Clean();
		});
	});

	describe("AttachToInstance", () => {
		it("should return a connection", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			part.Parent = game.GetService("Workspace");

			const connection = vault.AttachToInstance(part);
			expect(connection).to.be.ok();

			vault.Clean();
			part.Destroy();
		});

		it("should clean the vault when the instance is destroyed", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			part.Parent = game.GetService("Workspace");

			let cleanedUp = false;
			vault.Add(() => {
				cleanedUp = true;
			});
			vault.AttachToInstance(part);

			part.Destroy();
			task.wait();

			expect(vault.IsCleaned()).to.equal(true);
			expect(cleanedUp).to.equal(true);
		});
	});

	describe("Construct", () => {
		it("should construct with a function constructor and add to vault", () => {
			const vault = new Vault();
			const part = vault.Construct(() => {
				const p = new Instance("Part");
				p.Name = "ConstructedPart";
				return p;
			});
			expect(part.Name).to.equal("ConstructedPart");
			expect(vault.Size()).to.equal(1);
			expect(vault.Contains(part)).to.equal(true);
			vault.Clean();
		});

		it("should clean constructed objects on vault clean", () => {
			const vault = new Vault();
			const part = vault.Construct(() => {
				const p = new Instance("Part");
				p.Parent = game.GetService("Workspace");
				return p;
			});
			expect(part.Parent).to.be.ok();
			vault.Clean();
			expect(part.Parent).to.equal(undefined);
		});
	});

	describe("Extend", () => {
		it("should create a child vault", () => {
			const parent = new Vault("Parent");
			const child = parent.Extend("Child");
			expect(child).to.be.ok();
			expect(child.GetName()).to.equal("Child");
			parent.Clean();
		});

		it("should set the parent reference", () => {
			const parent = new Vault("Parent");
			const child = parent.Extend("Child");
			expect(child.GetParent()).to.equal(parent);
			parent.Clean();
		});

		it("should appear in parent's children", () => {
			const parent = new Vault("Parent");
			parent.Extend("Child1");
			parent.Extend("Child2");
			expect(parent.GetChildren().size()).to.equal(2);
			parent.Clean();
		});

		it("should clean child when parent is cleaned", () => {
			const parent = new Vault("Parent");
			const child = parent.Extend("Child");

			let childCleaned = false;
			child.Add(() => {
				childCleaned = true;
			});

			parent.Clean();
			expect(childCleaned).to.equal(true);
			expect(child.IsCleaned()).to.equal(true);
		});

		it("should work without a name", () => {
			const parent = new Vault();
			const child = parent.Extend();
			expect(child.GetName()).to.equal(undefined);
			parent.Clean();
		});

		it("should remove child from parent when child cleans itself", () => {
			const parent = new Vault("Parent");
			const child = parent.Extend("Child");
			expect(parent.GetChildren().size()).to.equal(1);

			child.Clean();
			expect(parent.GetChildren().size()).to.equal(0);

			parent.Clean();
		});

		it("should support nested extend (grandchild)", () => {
			const grandparent = new Vault("GrandParent");
			const parentVault = grandparent.Extend("Parent");
			const child = parentVault.Extend("Child");

			let childCleaned = false;
			child.Add(() => {
				childCleaned = true;
			});

			grandparent.Clean();
			expect(childCleaned).to.equal(true);
		});
	});

	describe("Import", () => {
		it("should return the vault for chaining", () => {
			const vaultA = new Vault();
			const vaultB = new Vault();
			const result = vaultA.Import(vaultB);
			expect(result).to.equal(vaultA);
			vaultA.Clean();
		});

		it("should clean imported vault when this vault is cleaned", () => {
			const vaultA = new Vault("A");
			const vaultB = new Vault("B");

			let bCleaned = false;
			vaultB.Add(() => {
				bCleaned = true;
			});

			vaultA.Import(vaultB);
			vaultA.Clean();

			expect(bCleaned).to.equal(true);
			expect(vaultB.IsCleaned()).to.equal(true);
		});

		it("should add the import cleanup function to vault entries", () => {
			const vaultA = new Vault();
			const vaultB = new Vault();
			vaultA.Import(vaultB);
			expect(vaultA.Size()).to.equal(1);
			vaultA.Clean();
		});
	});

	describe("Clone", () => {
		it("should clone an instance and add it to the vault", () => {
			const vault = new Vault();
			const original = new Instance("Part");
			original.Name = "Original";

			const cloned = vault.Clone(original);
			expect(cloned).to.be.ok();
			expect(cloned.Name).to.equal("Original");
			expect(cloned).never.to.equal(original);
			expect(vault.Size()).to.equal(1);
			expect(vault.Contains(cloned)).to.equal(true);

			vault.Clean();
			original.Destroy();
		});

		it("should destroy the clone when vault is cleaned", () => {
			const vault = new Vault();
			const original = new Instance("Part");
			const cloned = vault.Clone(original);
			cloned.Parent = game.GetService("Workspace");

			vault.Clean();
			expect(cloned.Parent).to.equal(undefined);
			original.Destroy();
		});

		it("should not affect the original instance", () => {
			const vault = new Vault();
			const original = new Instance("Part");
			original.Parent = game.GetService("Workspace");
			vault.Clone(original);
			vault.Clean();
			expect(original.Parent).to.equal(game.GetService("Workspace"));
			original.Destroy();
		});
	});

	describe("Defer", () => {
		it("should execute the callback and return its result", () => {
			const vault = new Vault();
			const result = vault.Defer(() => {
				return "hello" as unknown as Cleanable;
			});
			expect(result).to.equal("hello");
			vault.Clean();
		});

		it("should clean up scope resources after callback", () => {
			const vault = new Vault();
			let scopeCleaned = false;

			vault.Defer((scope) => {
				scope.Add(() => {
					scopeCleaned = true;
				});
			});

			expect(scopeCleaned).to.equal(true);
			vault.Clean();
		});

		it("should return undefined when callback returns nothing", () => {
			const vault = new Vault();
			const result = vault.Defer(() => {});
			expect(result).to.equal(undefined);
			vault.Clean();
		});
	});

	describe("Contains", () => {
		it("should return true for added objects", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			vault.Add(part);
			expect(vault.Contains(part)).to.equal(true);
			vault.Clean();
		});

		it("should return false for non-added objects", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			expect(vault.Contains(part)).to.equal(false);
			part.Destroy();
			vault.Clean();
		});

		it("should return false after object is removed", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			vault.Add(part);
			vault.Remove(part);
			expect(vault.Contains(part)).to.equal(false);
			vault.Clean();
		});

		it("should return false after vault is cleaned", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			vault.Add(part);
			vault.Clean();
			expect(vault.Contains(part)).to.equal(false);
		});
	});

	describe("Size", () => {
		it("should return 0 for empty vault", () => {
			const vault = new Vault();
			expect(vault.Size()).to.equal(0);
			vault.Clean();
		});

		it("should reflect the number of added objects", () => {
			const vault = new Vault();
			vault.Add(new Instance("Part"));
			expect(vault.Size()).to.equal(1);
			vault.Add(new Instance("Part"));
			expect(vault.Size()).to.equal(2);
			vault.Add(new Instance("Part"));
			expect(vault.Size()).to.equal(3);
			vault.Clean();
		});

		it("should decrease when removing objects", () => {
			const vault = new Vault();
			const part = new Instance("Part");
			vault.Add(part);
			expect(vault.Size()).to.equal(1);
			vault.Remove(part);
			expect(vault.Size()).to.equal(0);
			vault.Clean();
		});

		it("should be 0 after clean", () => {
			const vault = new Vault();
			vault.Add(new Instance("Part"));
			vault.Add(new Instance("Part"));
			vault.Clean();
			expect(vault.Size()).to.equal(0);
		});
	});

	describe("IsCleaned", () => {
		it("should return false before cleaning", () => {
			const vault = new Vault();
			expect(vault.IsCleaned()).to.equal(false);
			vault.Clean();
		});

		it("should return true after Clean()", () => {
			const vault = new Vault();
			vault.Clean();
			expect(vault.IsCleaned()).to.equal(true);
		});

		it("should return true after Destroy()", () => {
			const vault = new Vault();
			vault.Destroy();
			expect(vault.IsCleaned()).to.equal(true);
		});
	});

	describe("GetName", () => {
		it("should return the name if set", () => {
			const vault = new Vault("MyVault");
			expect(vault.GetName()).to.equal("MyVault");
			vault.Clean();
		});

		it("should return undefined if no name", () => {
			const vault = new Vault();
			expect(vault.GetName()).to.equal(undefined);
			vault.Clean();
		});
	});

	describe("GetEntries", () => {
		it("should return an empty array for empty vault", () => {
			const vault = new Vault();
			expect(vault.GetEntries().size()).to.equal(0);
			vault.Clean();
		});

		it("should return all added entries", () => {
			const vault = new Vault();
			const partA = new Instance("Part");
			const partB = new Instance("Part");
			vault.Add(partA);
			vault.Add(partB);

			const entries = vault.GetEntries();
			expect(entries.size()).to.equal(2);
			vault.Clean();
		});

		it("should be empty after clean", () => {
			const vault = new Vault();
			vault.Add(new Instance("Part"));
			vault.Clean();
			expect(vault.GetEntries().size()).to.equal(0);
		});
	});

	describe("GetChildren", () => {
		it("should return empty array when no children", () => {
			const vault = new Vault();
			expect(vault.GetChildren().size()).to.equal(0);
			vault.Clean();
		});

		it("should return all children", () => {
			const vault = new Vault();
			vault.Extend("A");
			vault.Extend("B");
			expect(vault.GetChildren().size()).to.equal(2);
			vault.Clean();
		});

		it("should return a cloned array (not a direct reference)", () => {
			const vault = new Vault();
			vault.Extend("A");
			const childrenA = vault.GetChildren();
			const childrenB = vault.GetChildren();
			expect(childrenA).never.to.equal(childrenB);
			vault.Clean();
		});
	});

	describe("GetParent", () => {
		it("should return undefined for root vault", () => {
			const vault = new Vault();
			expect(vault.GetParent()).to.equal(undefined);
			vault.Clean();
		});

		it("should return the parent vault", () => {
			const parent = new Vault("Parent");
			const child = parent.Extend("Child");
			expect(child.GetParent()).to.equal(parent);
			parent.Clean();
		});
	});

	describe("ConfigureVault", () => {
		afterEach(() => {
			ConfigureVault({ SAFE_MODE: false, DEBUG_MODE: false });
		});

		it("should set SAFE_MODE", () => {
			ConfigureVault({ SAFE_MODE: true });
			const cfg = GetVaultConfig();
			expect(cfg.SAFE_MODE).to.equal(true);
		});

		it("should set DEBUG_MODE", () => {
			ConfigureVault({ DEBUG_MODE: true });
			const cfg = GetVaultConfig();
			expect(cfg.DEBUG_MODE).to.equal(true);
		});

		it("should allow partial config updates", () => {
			ConfigureVault({ SAFE_MODE: true });
			const cfg = GetVaultConfig();
			expect(cfg.SAFE_MODE).to.equal(true);
			expect(cfg.DEBUG_MODE).to.equal(false);
		});

		it("should return a frozen config", () => {
			const cfg = GetVaultConfig();
			expect(table.isfrozen(cfg)).to.equal(true);
		});
	});

	describe("SAFE_MODE", () => {
		afterEach(() => {
			ConfigureVault({ SAFE_MODE: false });
		});

		it("should wrap cleanup errors with descriptive message when SAFE_MODE is enabled", () => {
			ConfigureVault({ SAFE_MODE: true });
			const vault = new Vault();
			const badObj = {
				Destroy() {
					error("intentional error");
				},
			};
			vault.Add(badObj);

			expect(() => vault.Clean()).to.throw();
		});
	});

	describe("Integration", () => {
		it("should handle a complex lifecycle", () => {
			const root = new Vault("Root");
			const child = root.Extend("Child");

			let fnCallCount = 0;
			child.Add(() => fnCallCount++);
			child.Add(() => fnCallCount++);
			child.Add(() => fnCallCount++);

			const part = new Instance("Part");
			part.Parent = game.GetService("Workspace");
			root.Add(part);

			expect(root.Size()).to.equal(1);
			expect(root.GetChildren().size()).to.equal(1);
			expect(child.Size()).to.equal(3);

			root.Clean();

			expect(fnCallCount).to.equal(3);
			expect(root.IsCleaned()).to.equal(true);
			expect(child.IsCleaned()).to.equal(true);
			expect(root.Size()).to.equal(0);
			expect(part.Parent).to.equal(undefined);
		});

		it("should support Import chaining with Extend", () => {
			const main = new Vault("Main");
			const external = new Vault("External");

			let externalCleaned = false;
			external.Add(() => {
				externalCleaned = true;
			});

			const child = main.Extend("Child");
			child.Import(external);

			main.Clean();
			expect(externalCleaned).to.equal(true);
		});

		it("should handle adding multiple resource types", () => {
			const vault = new Vault("Mixed");

			const part = new Instance("Part");
			part.Parent = game.GetService("Workspace");
			vault.Add(part);

			const bindable = new Instance("BindableEvent");
			const conn = bindable.Event.Connect(() => {});
			vault.Add(conn);

			let fnCalled = false;
			vault.Add(() => {
				fnCalled = true;
			});

			let destroyCalled = false;
			vault.Add({
				Destroy() {
					destroyCalled = true;
				},
			});

			expect(vault.Size()).to.equal(4);
			vault.Clean();

			expect(part.Parent).to.equal(undefined);
			expect(conn.Connected).to.equal(false);
			expect(fnCalled).to.equal(true);
			expect(destroyCalled).to.equal(true);
			bindable.Destroy();
		});
	});
};
