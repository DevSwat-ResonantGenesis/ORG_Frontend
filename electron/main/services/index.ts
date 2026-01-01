// Export all services
export { BackendService } from './backendService';
export { DockerService } from './dockerService';
export { LSPService } from './lspService';
export { FileWatcherService } from './fileWatcherService';
export { UpdaterService } from './updaterService';
export { WindowStateService } from './windowStateService';
export { PlatformService } from './platformService';

// Initialize services singleton
import { BackendService } from './backendService';
import { DockerService } from './dockerService';
import { LSPService } from './lspService';
import { FileWatcherService } from './fileWatcherService';
import { UpdaterService } from './updaterService';
import { WindowStateService } from './windowStateService';
import { PlatformService } from './platformService';

export const backendService = new BackendService();
export const dockerService = new DockerService();
export const lspService = new LSPService();
export const fileWatcherService = new FileWatcherService();
export const updaterService = new UpdaterService();
export const windowStateService = new WindowStateService();
export const platformService = new PlatformService();

