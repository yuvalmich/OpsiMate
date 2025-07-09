import * as k8s from '@kubernetes/client-node';
import {DiscoveredService, Provider} from "@service-peek/shared";
import path from "path";
import fs from "fs";

const PRIVATE_KEYS_DIR = path.join(__dirname, '../../data/private-keys');

function getKeyPath(filename: string) {
    const filePath = path.join(PRIVATE_KEYS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Key not found: ${filePath}`);
    }
    return filePath;
}


const executeCommandOnKubernetes = async (_provider: Provider): Promise<DiscoveredService[]> => {
    const kc: k8s.KubeConfig = new k8s.KubeConfig();
    const privateKeyPath = getKeyPath(_provider.privateKeyFilename);

    kc.loadFromFile(privateKeyPath);

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const servicesResp = await k8sApi.listServiceForAllNamespaces();

    return servicesResp.items.map(svc => {
        const name = svc.metadata?.name || 'unknown';
        const serviceIP = svc.spec?.clusterIP || 'None';
        // TODO how to choose the correct port?
        const ports = (svc.spec?.ports || []).map(
            p => `${p.port}${p.protocol ? '/' + p.protocol : ''}`
        );

        // TODO - should fetch the status of the service
        return {name, serviceIP, port: ports[0] ?? '', serviceStatus: "running"};
    });
}

export {executeCommandOnKubernetes}