---
sidebar_position: 17
title: Size
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Size

Returns the number of resources currently being tracked by the Vault.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const part = new Instance("Part")
    vault.Add(part)
    
    print(vault.Size()) // 1
    
    vault.Add(new Instance("Part"))
    print(vault.Size()) // 2
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local part = Instance.new("Part")
    vault:Add(part)
    
    print(vault:Size()) -- 1
    
    vault:Add(Instance.new("Part"))
    print(vault:Size()) -- 2
    ```
  </TabItem>
</Tabs>

## Returns

`number` - The current number of tracked resources