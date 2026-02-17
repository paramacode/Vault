---
sidebar_position: 22
title: GetParent
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GetParent

Returns the parent vault of this Vault, if any.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const parent = new Vault()
    const child = parent.Extend()
    
    print(child.GetParent() === parent) // true
    print(parent.GetParent()) // undefined
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local parent = Vault.new()
    local child = parent:Extend()
    
    print(child:GetParent() == parent) -- true
    print(parent:GetParent()) -- undefined
    ```
  </TabItem>
</Tabs>

## Returns

`Descriptor | undefined` - The parent vault, if set