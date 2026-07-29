# KitchenOS v5.10.15

Prep selector refactor:
- Product, Unit, Section, and Assigned now use one shared SelectionField event path.
- One shared centred selection sheet renders every option list.
- Removed dynamic Section/Assigned controls and their separate handlers.
- Quantity remains the only specialised control.
