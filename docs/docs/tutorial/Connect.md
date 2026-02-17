---
sidebar_position: 4
title: Connect
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect

Creates a signal connection and automatically adds it to the Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const part = new Instance("Part")
    
    const connection = vault.Connect(part.Touched, () => {
        print("Touched")
    })
    
    vault.Clean() // Connection is disconnected
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local part = Instance.new("Part")
    
    local connection = vault:Connect(part.Touched, function()
        print("Touched")
    end)
    
    vault:Clean() -- Connection is disconnected
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `signal` | `AnySignal<T>` | Signal to connect to |
| `callback` | `(...args: T) => void` | Function to call |

## Returns

`Connection` - The created connection (auto-added to vault)