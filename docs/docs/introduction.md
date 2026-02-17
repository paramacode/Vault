---
sidebar_position: 1
---

# Introduction

Welcome to **Vault**. A lightweight, type-safe resource management library built for scalable Roblox projects.

Vault helps you control lifecycle, ownership, and cleanup of resources in a predictable way. Instead of scattering cleanup logic across your codebase, **Vault** centralizes it. You create a vault, store resources inside it, and dispose of everything deterministically when needed.

No hidden magic. No implicit behavior. Just explicit control over what lives and what gets destroyed.

---

## Why Vault?

As projects grow, resource management becomes a silent source of bugs:

- Memory leaks from forgotten connections  
- Event listeners that never disconnect  
- Instances that outlive their intended scope  
- Hard-to-track ownership chains  

**Vault** enforces structure. If something is created, it belongs somewhere. If it belongs somewhere, it can be cleaned up safely.

---

## Core Concept

A **Vault** is a container for disposable resources.

You:

1. Create a vault.
2. Add resources to it.
3. Dispose the vault when you're done.

When a vault is destroyed, everything inside it is cleaned up in a controlled and predictable order.

This makes systems safer, easier to reason about, and far more maintainable at scale.