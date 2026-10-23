import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind';

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});

// Avoid port 3000 collision when Studio is running simultaneously
Config.setPort(3456);
Config.setChromiumDisableWebSecurity(true);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
