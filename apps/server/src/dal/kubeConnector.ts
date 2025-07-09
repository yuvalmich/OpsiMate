import * as k8s from '@kubernetes/client-node';
import {DiscoveredService, Provider} from "@service-peek/shared";
import path from "path";
import fs from "fs";
import {ObjectCoreV1Api} from "@kubernetes/client-node/dist/gen/types/ObjectParamAPI";

const PRIVATE_KEYS_DIR = path.join(__dirname, '../../data/private-keys');

function getKeyPath(filename: string) {
    const filePath = path.join(PRIVATE_KEYS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Key not found: ${filePath}`);
    }
    return filePath;
}

const createClient = (_provider: Provider): ObjectCoreV1Api => {
    const kc: k8s.KubeConfig = new k8s.KubeConfig();
    const privateKeyPath = getKeyPath(_provider.privateKeyFilename);

    kc.loadFromFile(privateKeyPath);

    return kc.makeApiClient(k8s.CoreV1Api);
}

const getK8RLogs = async (_provider: Provider, serviceName: string, namespace: string) => {
    const k8sApi = createClient(_provider)
    return k8sApi.readNamespacedPodLog(
        {
            name: serviceName,
            namespace: namespace,
            pretty: 'true'
        })
}


const getK8SServices = async (_provider: Provider): Promise<DiscoveredService[]> => {
    const k8sApi = createClient(_provider)
    const servicesResp = await k8sApi.listServiceForAllNamespaces();

    return servicesResp.items.map(svc => {
        const name = svc.metadata?.name || 'unknown';
        const serviceIP = svc.spec?.clusterIP || 'None';
        // TODO how to choose the correct port?
        const ports = (svc.spec?.ports || []).map(
            p => `${p.port}${p.protocol ? '/' + p.protocol : ''}`
        );

        // TODO - should fetch the status of the service
        return {
            name,
            serviceIP,
            port: ports[0] ?? '',
            serviceStatus: "running",
            namespace: svc.metadata?.namespace || 'default'
        };
    });
}

export {getK8SServices, getK8RLogs}