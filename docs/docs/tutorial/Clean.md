---
sidebar_position: 3
title: Clean/Destroy
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Clean

Cleans all resources managed by the Vault and prepares it for garbage collection.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const vault = new Vault()
    
    const part = new Instance("Part")
    part.Parent = workspace
    vault.Add(part)
    
    const connection = part.Touched.Connect(() => {
        print("Touched")
    })
    vault.Add(connection)
    
    vault.Clean()
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local vault = Vault.new()
    
    local part = Instance.new("Part")
    part.Parent = workspace
    vault:Add(part)
    
    local connection = part.Touched:Connect(function()
        print("Touched")
    end)
    vault:Add(connection)
    
    vault:Clean()
    ```
  </TabItem>
</Tabs>

## Behavior

The `Clean` method performs a comprehensive cleanup of the Vault and its resources:

1. **Prevents double-cleaning**: If the vault was already cleaned, returns immediately
2. **Hierarchical cleanup**: Recursively cleans all child vaults first
3. **Resource cleanup**: Executes cleanup logic for every tracked resource
4. **State reset**: Clears all internal tracking structures
5. **Parent detachment**: Removes itself from parent vault's children collection
