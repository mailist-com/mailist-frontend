import { Signal } from '@angular/core';

/**
 * Interface for node settings components
 * Each node type should implement this interface
 */
export interface INodeSettings {
  /**
   * Load data into the component from node data
   */
  loadData(data: Record<string, any>): void;

  /**
   * Export component data as key-value map
   */
  exportData(): Record<string, any>;

  /**
   * Check if component data is valid
   */
  isValid(): boolean;

  /**
   * Signal that emits when data changes
   */
  dataChanged: Signal<void>;
}
