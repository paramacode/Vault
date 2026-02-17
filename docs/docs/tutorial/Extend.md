---
sidebar_position: 11
title: Extend
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Extend

Creates a child Vault that will be automatically cleaned when the parent is cleaned.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const parent = new Vault("Parent")
    const child = parent.Extend("Child")
    
    child.Add(new Instance("Part"))
    
    parent.Clean()
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local parent = Vault.new("Parent")
    local child = parent:Extend("Child")
    
    child:Add(Instance.new("Part"))
    
    parent:Clean()
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name?` | `string` | Optional name for the child vault |

## Returns

`Descriptor` - The newly created child vault

## Behavior

- Creates a new vault instance as a child of the current vault
- Child is automatically cleaned when parent is cleaned
- Enables hierarchical cleanup structures
- Child vaults can have their own children