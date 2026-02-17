---
sidebar_position: 7
title: BindToHeartbeat
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# BindToHeartbeat

Connects to `RunService.Heartbeat` and automatically manages the connection.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    vault.BindToHeartbeat((deltaTime) => {
        print(`Heartbeat: ${deltaTime}`)
    })
    
    // Later...
    vault.Clean()
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    vault:BindToHeartbeat(function(deltaTime)
        print(`Heartbeat: {deltaTime}`)
    end)
    
    vault:Clean()
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `(deltaTime: number) => void` | Function to call every frame |

## Returns

`Descriptor` - The vault instance (for chaining)

## Behavior

- Wraps `RunService.Heartbeat.Connect()`
- Automatically adds the connection to the vault
- Returns `this` for method chaining