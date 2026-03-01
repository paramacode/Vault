local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Vault = ReplicatedStorage:WaitForChild("Vault")

local TestEZ = require(Vault.include.node_modules["@rbxts"].testez.src)

local results = TestEZ.TestBootstrap:run({
	ReplicatedStorage.Vault.Tests
})

if results.failureCount > 0 then
	error(`Failed an amount of "{results.failureCount}" tests: "{results.errors}"`)
end