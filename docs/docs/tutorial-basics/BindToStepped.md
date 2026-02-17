---
sidebar_position: 8
title: BindToStepped
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# BindToStepped

Connects to `RunService.Stepped` and automatically manages the connection.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    vault.BindToStepped((deltaTime: number, alpha: number) => {
        print(`Stepped - Delta: ${deltaTime}, Alpha: ${alpha}`)
    })
    
    vault.Clean()
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    vault:BindToStepped(function(deltaTime: number, alpha: number)
        print(`Stepped - Delta: {deltaTime}, Alpha: {alpha}`)
    end)
    
    vault:Clean()
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `(deltaTime: number, alpha: number) => void` | Function to call every stepped frame |

## Returns

`Descriptor` - The vault instance (for chaining)

## Behavior

- Wraps `RunService.Stepped.Connect()`
- Automatically adds the connection to the vault
- Returns `this` for method chaining