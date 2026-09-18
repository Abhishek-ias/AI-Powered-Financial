// ============================================================
// Mock Workflow Provider
// ============================================================
import { WorkflowProvider, WorkflowTriggerResult, WorkflowStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const executions = new Map<string, WorkflowStatus>();

export class MockWorkflowProvider implements WorkflowProvider {
  readonly providerMode = 'MOCK';

  async trigger(workflowId: string, payload: Record<string, unknown>): Promise<WorkflowTriggerResult> {
    const executionId = `exec-mock-${uuidv4().slice(0, 8)}`;
    executions.set(executionId, {
      executionId,
      status: 'COMPLETED',
      providerMode: 'MOCK',
      safetyNote: 'Simulated n8n workflow execution in mock mode',
      result: {
        workflowId,
        providerMode: 'MOCK',
        processedAt: new Date().toISOString(),
        ...payload,
      },
    });
    return {
      executionId,
      status: 'COMPLETED',
      providerMode: 'MOCK',
      safetyNote: 'Simulated n8n workflow execution in mock mode',
    };
  }

  async getStatus(executionId: string): Promise<WorkflowStatus> {
    return (
      executions.get(executionId) || {
        executionId,
        status: 'NOT_FOUND',
        providerMode: 'MOCK',
        safetyNote: 'Simulated n8n workflow execution in mock mode',
      }
    );
  }
}
