import re

with open('src/components/operations/Operations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove anomalies from activeSubTab type
content = re.sub(r"const \[activeSubTab, setActiveSubTab\] = useState\<'logger' \| 'analytics' \| 'tanks' \| 'anomalies' \| 'voyages'\>\('logger'\);", "const [activeSubTab, setActiveSubTab] = useState<'logger' | 'analytics' | 'tanks' | 'voyages'>('logger');", content)

# Remove Sudden Gap anomaly tab button block
anomaly_btn_pattern = r"<button\s+onClick=\{\(\) => setActiveSubTab\('anomalies'\)\}[\s\S]*?<span>Sudden Gap Detector[^\n]*\n\s*</button>"
content = re.sub(anomaly_btn_pattern, "", content, flags=re.MULTILINE)

# Add import VoyagePlanner at the top
content = re.sub(r"import \{ useOperationsStore \} from '@marineos/shared';", "import { useOperationsStore } from '@marineos/shared';\nimport { VoyagePlanner } from './VoyagePlanner';", content)

# Remove unused imports
content = re.sub(r"FuelAnomalyReport, ", "", content)

# Remove fuelAnomalies, resolveFuelAnomaly from useApp() call
content = re.sub(r"fuelAnomalies, resolveFuelAnomaly, ", "", content)

# Replace the voyage and anomaly rendering blocks with VoyagePlanner
voyages_block_start = content.find("{/* Subtab 3: Sudden Gap Anomaly Detector */}")
if voyages_block_start != -1:
    end_of_return = content.rfind("    </div>\n  );\n};")
    if end_of_return != -1:
        new_render = """        {/* Subtab 4: Voyage Planning & Itineraries */}
        {activeSubTab === 'voyages' && (
          <VoyagePlanner />
        )}
"""
        new_render = new_render.replace('\\"', '"') # just in case
        content = content[:voyages_block_start] + new_render + content[end_of_return:]

with open('src/components/operations/Operations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
