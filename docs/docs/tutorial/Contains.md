---
sidebar_position: 16
title: Contains
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Contains

Checks if an object is currently being tracked by the Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const part = new Instance("Part")
    vault.Add(part)
    
    print(vault.Contains(part)) // true
    print(vault.Contains(new Instance("Part"))) // false
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local part = Instance.new("Part")
    vault:Add(part)
    
    print(vault:Contains(part)) -- true
    print(vault:Contains(Instance.new("Part"))) -- false
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `object` | `unknown` | The object to check |

## Returns

`boolean` - `true` if the object is in the vault, `false` otherwise