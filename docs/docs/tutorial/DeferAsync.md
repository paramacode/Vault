---
sidebar_position: 15
title: DeferAsync
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DeferAsync

Creates a temporary scope for async operations that cleans up automatically after all promises resolve.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const result = await vault.DeferAsync(async (scope) => {
        const part = new Instance("Part")
        scope.Add(part)
        
        const data = await fetchData()
        return data
    })  
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local result = await vault:DeferAsync(function(scope)
        local part = Instance.new("Part")
        scope:Add(part)
        
        local data = await fetchData()
        return data
    end) 
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `(scope: VaultDefer) => Promise<T>` | Async function that receives a scope |

## Returns

`Promise<T \| undefined>` - The callback's resolved value, or undefined if error

## Behavior

- Creates a child vault for the async operation
- Tracks all promises and cleans up only when all complete
- Scope resources are automatically cleaned after promises resolve/reject
- Handles both sync errors (pcall) and async errors (promise catch)
- Perfect for async operations with temporary resources