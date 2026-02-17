---
sidebar_position: 9
title: AttachToInstance
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AttachToInstance

Automatically cleans the vault when the given Instance is destroyed.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const part = new Instance("Part")
    
    vault.AttachToInstance(part)
    
    part.Destroy()
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local part = Instance.new("Part")
    
    vault:AttachToInstance(part)
    
    part:Destroy()
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `instance` | `Instance` | Instance whose destruction triggers vault cleanup |

## Returns

`Connection` - The Destroying signal connection (auto-added to vault)

## Behavior

- Connects to the instance's `Destroying` signal
- When instance is destroyed, automatically cleans the vault
- Returns the connection for manual management if needed