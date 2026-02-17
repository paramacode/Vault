---
sidebar_position: 13
title: Clone
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Clone

Clones an Instance and automatically adds the clone to the Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const original = new Instance("Part")
    const clone = vault.Clone(original)
    
    clone.Parent = workspace
    
    vault.Clean() 
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local original = Instance.new("Part")
    local clone = vault:Clone(original)
    
    clone.Parent = workspace
    
    vault:Clean()
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `instance` | `Instance` | The instance to clone |

## Returns

`Instance` - The cloned instance (auto-added to vault)

## Behavior

- Wraps `Instance:Clone()`
- Automatically adds the clone to the vault
- Returns the clone for immediate use
- Original instance remains unchanged