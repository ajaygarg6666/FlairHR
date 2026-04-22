import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  http.get('/automations', async () => {
    await delay(500);
    return HttpResponse.json([
      { id: "send_email", label: "Send Email", params: ["to", "subject"] },
      { id: "generate_doc", label: "Generate Document", params: ["template", "recipient"] },
      { id: "notify_slack", label: "Slack Notification", params: ["channel", "message"] },
    ]);
  }),

  http.post('/simulate', async ({ request }) => {
    const workflow = await request.json() as any;
    await delay(1000);

    const { nodes, edges } = workflow;
    const logs = [];
    const visited = new Set();
    const queue = [];

    const startNode = nodes.find((n: any) => n.data.type === 'start');
    if (startNode) {
      queue.push(startNode);
    }

    let step = 1;
    while (queue.length > 0) {
      const currentNode = queue.shift();
      if (visited.has(currentNode.id)) continue;
      visited.add(currentNode.id);

      logs.push({
        timestamp: new Date(Date.now() + step * 1000).toISOString(),
        nodeId: currentNode.id,
        nodeTitle: currentNode.data.title,
        status: 'success',
        message: `Step ${step}: ${currentNode.data.type === 'automation' ? 'Executing automated' : 'Processing'} ${currentNode.data.type} node.`,
      });

      const nextNodeIds = edges.filter((e: any) => e.source === currentNode.id).map((e: any) => e.target);
      const nextNodes = nodes.filter((n: any) => nextNodeIds.includes(n.id));
      queue.push(...nextNodes);
      step++;
      
      if (step > 20) break; // Safety break
    }

    return HttpResponse.json(logs);
  }),
];
