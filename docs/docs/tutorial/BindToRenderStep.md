---
sidebar_position: 6
title: BindToRenderStep
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# BindToRenderStep

Binds a function to a render step and automatically unbinds it when the vault is cleaned.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    vault.BindToRenderStep("MyRenderStep", Enum.RenderPriority.Character, (deltaTime) => {
        print(`Rendering frame: ${deltaTime}`)
    })
    
    vault.Clean() // Automatically unbinds "MyRenderStep"
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    vault:BindToRenderStep("MyRenderStep", Enum.RenderPriority.Character, function(deltaTime)
        print(`Rendering frame: {deltaTime}`)
    end)
    
    vault:Clean()
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Unique name for the render step |
| `priority` | `number` | Render priority (use `Enum.RenderPriority`) |
| `callback` | `(deltaTime: number) => void` | Function to call each frame |

## Returns

`Descriptor` - The vault instance (for chaining)

## Behavior

- Wraps `RunService.BindToRenderStep`
- Automatically registers cleanup to unbind when vault is cleaned
- Returns `this` for method chaining