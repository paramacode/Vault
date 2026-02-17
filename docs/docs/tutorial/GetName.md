---
sidebar_position: 19
title: GetName
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GetName

Returns the optional name assigned to the Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const vault = new Vault("MyVault")
    print(vault.GetName()) // "MyVault"
    
    const unnamed = new Vault()
    print(unnamed.GetName()) // undefined
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local vault = Vault.new("MyVault")
    print(vault:GetName()) -- "MyVault"
    
    local unnamed = Vault.new()
    print(unnamed:GetName()) -- undefined
    ```
  </TabItem>
</Tabs>

## Returns

`string | undefined` - The vault's name, if set