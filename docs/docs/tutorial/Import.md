---
sidebar_position: 12
title: Import
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Import

Imports another vault so it gets cleaned when this vault is cleaned.

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    const vaultA = new Vault()
    const vaultB = new Vault()
    
    vaultA.Import(vaultB)
    
    vaultA.Clean()
    ```
  </TabItem>
  
  <TabItem value="lua" label="Luau">
    ```lua
    local vaultA = Vault.new()
    local vaultB = Vault.new()
    
    vaultA:Import(vaultB)
    
    vaultA:Clean()
    ```
  </TabItem>
</Tabs>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `otherVault` | `Descriptor` | Another vault to import |

## Returns

`Descriptor` - This vault instance (for chaining)

## Behavior

- Creates a dependency where cleaning this vault also cleans the imported vault
- Useful for composing vaults from different sources
- Returns `this` for method chaining