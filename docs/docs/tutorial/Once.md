---
sidebar_position: 5
title: Once
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Once

Creates a one-time signal connection that auto-disconnects after first fire and is managed by the Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const part = new Instance("Part")
    
    const connection = vault.Once(part.Touched, () => {
        print("This will only print once")
    })
    
    vault.Clean() // Ensures cleanup if never fired
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local part = Instance.new("Part")
    
    local connection = vault:Once(part.Touched, function()
        print("This will only print once")
    end)
    
    vault:Clean() -- Ensures cleanup if never fired
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `signal` | `AnySignal<T>` | Signal to connect to |
| `callback` | `(...args: T) => void` | Function to call once |

## Returns

`Connection` - The created connection (auto-added to vault)

## Behavior

- Fires only once, then automatically disconnects
- Automatically removes itself from vault after firing
- Still tracked by vault until fired (for cleanup)