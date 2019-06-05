export const prefix = '/api';
export const devMode = 'development';
export const dependencies = [];
// export const devMode = 'production';
export const webImUrl = '';
export const workflowServerUrl = 'http://192.168.1.111/pep/v0.5.x';
export const transServerUrl = 'http://172.168.1.180:8080/home';
export const proxy = {
  '/stomp': {
    target: 'http://192.168.1.111/pep/develop',
    pathRewrite: {'^/stomp': '/stomp'},
  },
}
export const websocket = false;
