---
sidebar_position: 14
title: Defer
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Defer

Creates a temporary scope that cleans up automatically after the callback executes.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const result = vault.Defer((scope) => {
        const part = new Instance("Part")
        scope.Add(part) // Will be cleaned after callback
        
        const connection = scope.Connect(part.Touched, () => {
            print("Touched")
        })
        
        return "some result"
    })
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local result = vault:Defer(function(scope)
        local part = Instance.new("Part")
        scope:Add(part) -- Will be cleaned after callback
        
        local connection = scope:Connect(part.Touched, function()
            print("Touched")
        end)
        
        return "some result"
    end)
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `VaultDeferCallback` | Function that receives a temporary scope vault |

## Returns

`Cleanable \| undefined` - The callback's return value, or undefined if error

## Behavior

- Creates a child vault and passes it to the callback
- All resources added to the scope are automatically cleaned after callback
- If callback errors, logs the error and returns undefined
- Perfect for temporary operations that need cleanup