---
sidebar_position: 10
title: Construct
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Construct

Creates an instance of a class and automatically adds it to the Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const part = vault.Construct(Instance, "Part")
    part.Parent = workspace
    
    const tool = vault.Construct(() => new Instance("Tool"))
    
    vault.Clean() // Cleans both instances
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local part = vault:Construct(Instance, "Part")
    part.Parent = workspace
    
    local tool = vault:Construct(function()
        return Instance.new("Tool")
    end)
    
    vault:Clean()
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `classOrConstructor` | `Constructor<T, A> \| () -> T` | Class or factory function |
| `...args` | `A` | Arguments to pass to constructor |

## Returns

`T` - The constructed instance (auto-added to vault)

## Behavior

- Supports both class constructors and factory functions
- Automatically adds the created object to the vault
- Returns the created instance for immediate use