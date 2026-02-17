---
sidebar_position: 1
title: Add
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Add

Adds a resource to the Vault so it can be cleaned later.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const part = new Instance("Part")
    part.Parent = workspace

    vault.Add(part)

    const connection = part.Touched.Connect(() => {
        print("Touched")
    })

    vault.Add(connection)
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local part = Instance.new("Part")
    part.Parent = workspace

    vault:Add(part)

    local connection = part.Touched:Connect(function()
        print("Touched")
    end)

    vault:Add(connection)
    ```
  </TabItem>
</Tabs>