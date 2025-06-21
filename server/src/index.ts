import express from 'express';
import integrationRouter from './integration-router';
import healthRouter from './health-router';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api/v1', integrationRouter);
app.use('/', healthRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
public key
ssh port
username

integrate with provider (VM, K8S, Aws ec2) -> service[]


service_name
service_ip
service_status
 */
