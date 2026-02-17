---
sidebar_position: 20
title: GetEntries
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GetEntries

Returns a read-only array of all resources currently tracked by the Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    vault.Add(new Instance("Part"))
    vault.Add(new Instance("Tool"))
    
    const entries = vault.GetEntries()
    print(#entries) // 2
    
    for (const object of entries) {
        print(object.ClassName)
    }
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    vault:Add(Instance.new("Part"))
    vault:Add(Instance.new("Tool"))
    
    local entries = vault:GetEntries()
    print(#entries) -- 2
    
    for _, object in entries do
        print(object.ClassName)
    end
    ```
  </TabItem>
</Tabs>

## Returns

`ReadonlyArray<Cleanable>` - Array of tracked resources