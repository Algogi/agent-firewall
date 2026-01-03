/**
 * Logger Interface
 * 
 * Optional logger for receiving warnings from the firewall.
 * Users can implement this interface to integrate with their own logging system.
 */
export interface Logger {
  /**
   * Log a warning message.
   * 
   * @param message - Warning message to log
   */
  warn(message: string): void;
}

