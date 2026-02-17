---
sidebar_position: 21
title: GetChildren
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GetChildren

Returns an array of all child vaults attached to this Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const parent = new Vault()
    const child1 = parent.Extend("Child1")
    const child2 = parent.Extend("Child2")
    
    const children = parent.GetChildren()
    print(#children) // 2
    print(children[1].GetName()) // "Child1"
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local parent = Vault.new()
    local child1 = parent:Extend("Child1")
    local child2 = parent:Extend("Child2")
    
    local children = parent:GetChildren()
    print(#children) -- 2
    print(children[1]:GetName()) -- "Child1"
    ```
  </TabItem>
</Tabs>

## Returns

`Descriptor[]` - Array of child vaults (cloned, not a reference)