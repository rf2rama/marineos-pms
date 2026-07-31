import os
filepath = 'src/components/inventory/InventoryProcurement.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('Rp {', '${')
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed!')
