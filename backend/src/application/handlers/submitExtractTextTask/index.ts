import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { getConfig } from '../../helpers/config';

const config = getConfig();
const stepFunctions = new SFNClient({ region: config.REGION });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = event.body ? JSON.parse(event.body) : {};
  const { lessonId, userId } = body;

  if (!lessonId || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'lessonId and userId are required' }),
    };
  }

  if (!config.STEP_FUNCTION_ARN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'STEP_FUNCTION_ARN is not set' }),
    };
  }

  try {
    await stepFunctions.send(
      new StartExecutionCommand({
        stateMachineArn: config.STEP_FUNCTION_ARN,
        input: JSON.stringify({ lessonId, userId }),
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Task submitted successfully' }),
    };
  } catch (error) {
    console.error('Error submitting task:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to submit task' }),
    };
  }
};
