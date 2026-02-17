---
sidebar_position: 2
title: Remove
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Remove

Removes a resource from the Vault without cleaning it. Returns `true` if the resource was successfully removed, `false` otherwise.

The method accepts either the original object or its token identifier.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const part = new Instance("Part")
    part.Parent = workspace

    vault.Add(part)
    
    const removed = vault.Remove(part)
    print(`Part removed: ${removed}`)

    const connection = part.Touched.Connect(() => {
        print("Touched")
    })
    
    const token = vault.Add(connection)
    const removedByToken = vault.Remove(token)
    print(`Connection removed: ${removedByToken}`)

    const nonExistent = vault.Remove(123456) 
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local part = Instance.new("Part")
    part.Parent = workspace

    vault:Add(part)
    
    local removed = vault:Remove(part)
    print(`Part removed: {removed}`)

    local connection = part.Touched:Connect(function()
        print("Touched")
    end)
    
    local token = vault:Add(connection)
    local removedByToken = vault:Remove(token)
    print(`Connection removed: {removedByToken}`) 

    local nonExistent = vault:Remove(123456) 
    ```
  </TabItem>
</Tabs>

## Notes

Unlike `Clean()`, this method removes the resource **without** cleaning the entire vault, allowing individual resources to be managed separately.