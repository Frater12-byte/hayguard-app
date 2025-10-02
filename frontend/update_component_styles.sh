#!/bin/bash

# Function to update a component CSS file to use dashboard patterns
update_component_css() {
    local css_file="$1"
    local component_name="$2"
    
    echo "Updating $css_file..."
    
    # Backup original
    cp "$css_file" "${css_file}.backup"
    
    # Create new CSS with consistent patterns
    cat > "$css_file" << EOL
@import '../../styles/design-system.css';

/* ${component_name} - Dashboard Pattern */
.${component_name,,} {
  padding: var(--spacing-5);
  max-width: var(--container-md);
  margin: 0 auto;
}

.${component_name,,}-header {
  margin-bottom: var(--spacing-8);
}

.${component_name,,}-header h1 {
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-bold);
}

.${component_name,,}-subtitle {
  color: var(--text-muted);
  font-size: var(--font-size-base);
  margin: 0;
}

.${component_name,,}-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-5);
  margin-bottom: var(--spacing-10);
}

.${component_name,,}-card {
  background: var(--bg-white);
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-5);
  transition: box-shadow 0.2s;
}

.${component_name,,}-card:hover {
  box-shadow: var(--shadow-md);
}

.${component_name,,}-card h3 {
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-medium);
}

/* Loading and Error States */
.${component_name,,}-loading,
.${component_name,,}-error {
  text-align: center;
  padding: var(--spacing-10);
  color: var(--text-muted);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .${component_name,,} {
    padding: var(--spacing-4);
  }
  
  .${component_name,,}-content {
    grid-template-columns: 1fr;
  }
}
EOL
}

# Update all component CSS files
update_component_css "src/components/Sensors/Sensors.css" "Sensors"
update_component_css "src/components/Team/Team.css" "Team"  
update_component_css "src/components/Reports/Reports.css" "Reports"
update_component_css "src/components/Alerts/Alerts.css" "Alerts"

echo "All component CSS files updated with dashboard patterns!"
