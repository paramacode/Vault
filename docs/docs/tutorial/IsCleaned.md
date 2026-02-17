---
sidebar_position: 18
title: IsCleaned
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# IsCleaned

Checks if the Vault has already been cleaned.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    print(vault.IsCleaned()) // false
    
    vault.Clean()
    
    print(vault.IsCleaned()) // true
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    print(vault:IsCleaned()) -- false
    
    vault:Clean()
    
    print(vault:IsCleaned()) -- true
    ```
  </TabItem>
</Tabs>

## Returns

`boolean` - `true` if the vault has been cleaned, `false` otherwise