AWSTemplateFormatVersion: '2010-09-09'

Description: >
  HelpIn Application Stack:
    - Four AWS Lambda functions deployed from ZIP files in the core deployment bucket
    - Amazon API Gateway REST API with Cognito authentication for admin routes
    - Amazon EventBridge custom event bus and service-event routing rule
    - Amazon SQS processing queue and dead-letter queue
    - Amazon SNS alert topic and optional email subscription
    - Amazon CloudWatch log groups and alarms

Parameters:

  ProjectName:
    Type: String
    Default: helpin
    Description: Project name used for resource names and tags
    AllowedPattern: '^[a-z][a-z0-9-]*$'
    ConstraintDescription: Use lowercase letters, numbers, and hyphens, beginning with a letter

  CoreStackName:
    Type: String
    Default: helpin-core-stack
    Description: Name of the deployed HelpIn core CloudFormation stack

  LambdaRoleArn:
    Type: String
    Default: arn:aws:iam::963324839991:role/LabRole
    Description: Existing AWS Academy LabRole ARN used by the Lambda functions

  LambdaRuntime:
    Type: String
    Default: nodejs24.x
    AllowedValues:
      - nodejs24.x
    Description: Runtime used by all HelpIn Lambda functions

  LambdaMemory:
    Type: Number
    Default: 256
    MinValue: 128
    MaxValue: 1024
    Description: Memory allocated to each Lambda function in MB

  SearchFunctionS3Key:
    Type: String
    Default: lambda/search-function.zip
    Description: S3 object key for the Search Lambda ZIP package

  AdminFunctionS3Key:
    Type: String
    Default: lambda/admin-function.zip
    Description: S3 object key for the Admin Lambda ZIP package

  RecommendationFunctionS3Key:
    Type: String
    Default: lambda/recommendation-function.zip
    Description: S3 object key for the Recommendation Lambda ZIP package

  EventProcessorFunctionS3Key:
    Type: String
    Default: lambda/event-processor-function.zip
    Description: S3 object key for the Event Processor Lambda ZIP package

  AlertEmail:
    Type: String
    Default: ''
    Description: Optional email address for SNS alert notifications

  CorsAllowedOrigin:
    Type: String
    Default: '*'
    Description: Allowed frontend origin for API CORS responses

Conditions:
  HasAlertEmail: !Not [!Equals [!Ref AlertEmail, '']]

Resources:

  ############################################################
  # Messaging - SNS + SQS
  ############################################################

  HelpInAlertTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: !Sub '${ProjectName}-alerts'
      DisplayName: HelpIn Alerts
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  HelpInAlertEmailSubscription:
    Type: AWS::SNS::Subscription
    Condition: HasAlertEmail
    Properties:
      TopicArn: !Ref HelpInAlertTopic
      Protocol: email
      Endpoint: !Ref AlertEmail

  HelpInDeadLetterQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub '${ProjectName}-event-dlq'
      MessageRetentionPeriod: 1209600
      SqsManagedSseEnabled: true
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  HelpInEventQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub '${ProjectName}-event-queue'
      VisibilityTimeout: 360
      MessageRetentionPeriod: 345600
      ReceiveMessageWaitTimeSeconds: 20
      SqsManagedSseEnabled: true
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt HelpInDeadLetterQueue.Arn
        maxReceiveCount: 5
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  ############################################################
  # Event Management - EventBridge
  ############################################################

  HelpInEventBus:
    Type: AWS::Events::EventBus
    Properties:
      Name: !Sub '${ProjectName}-event-bus'

  HelpInEventQueuePolicy:
    Type: AWS::SQS::QueuePolicy
    Properties:
      Queues:
        - !Ref HelpInEventQueue
        - !Ref HelpInDeadLetterQueue
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Sid: AllowEventBridgeToSendToMainQueue
            Effect: Allow
            Principal:
              Service: events.amazonaws.com
            Action: sqs:SendMessage
            Resource: !GetAtt HelpInEventQueue.Arn
            Condition:
              ArnEquals:
                aws:SourceArn: !Sub 'arn:${AWS::Partition}:events:${AWS::Region}:${AWS::AccountId}:rule/${ProjectName}-event-bus/${ProjectName}-service-events'
          - Sid: AllowEventBridgeToSendToDeadLetterQueue
            Effect: Allow
            Principal:
              Service: events.amazonaws.com
            Action: sqs:SendMessage
            Resource: !GetAtt HelpInDeadLetterQueue.Arn
            Condition:
              ArnEquals:
                aws:SourceArn: !Sub 'arn:${AWS::Partition}:events:${AWS::Region}:${AWS::AccountId}:rule/${ProjectName}-event-bus/${ProjectName}-service-events'

  HelpInServiceEventRule:
    Type: AWS::Events::Rule
    DependsOn: HelpInEventQueuePolicy
    Properties:
      Name: !Sub '${ProjectName}-service-events'
      Description: Routes HelpIn service-management events to SQS for background processing
      EventBusName: !Ref HelpInEventBus
      State: ENABLED
      EventPattern:
        source:
          - helpin.application
        detail-type:
          - ServiceCreated
          - ServiceUpdated
          - ServiceDeleted
      Targets:
        - Id: HelpInEventQueueTarget
          Arn: !GetAtt HelpInEventQueue.Arn
          DeadLetterConfig:
            Arn: !GetAtt HelpInDeadLetterQueue.Arn

  ############################################################
  # Lambda Functions - ZIP Packages from Core S3 Bucket
  ############################################################

  SearchFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '${ProjectName}-search-function'
      Description: Searches and filters HelpIn service records
      Runtime: !Ref LambdaRuntime
      Handler: index.handler
      Role: !Ref LambdaRoleArn
      Timeout: 30
      MemorySize: !Ref LambdaMemory
      Code:
        S3Bucket:
          Fn::ImportValue: !Sub '${CoreStackName}-LambdaDeploymentBucketName'
        S3Key: !Ref SearchFunctionS3Key
      VpcConfig:
        SubnetIds:
          - Fn::ImportValue: !Sub '${CoreStackName}-PrivateAppSubnet1Id'
          - Fn::ImportValue: !Sub '${CoreStackName}-PrivateAppSubnet2Id'
        SecurityGroupIds:
          - Fn::ImportValue: !Sub '${CoreStackName}-LambdaSecurityGroupId'
      Environment:
        Variables:
          DB_HOST:
            Fn::ImportValue: !Sub '${CoreStackName}-DBEndpointAddress'
          DB_PORT:
            Fn::ImportValue: !Sub '${CoreStackName}-DBEndpointPort'
          DB_NAME:
            Fn::ImportValue: !Sub '${CoreStackName}-DBName'
          DB_SECRET_ARN:
            Fn::ImportValue: !Sub '${CoreStackName}-DBSecretArn'
          ASSETS_BUCKET:
            Fn::ImportValue: !Sub '${CoreStackName}-AssetsBucketName'
          CORS_ALLOWED_ORIGIN: !Ref CorsAllowedOrigin
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  AdminFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '${ProjectName}-admin-function'
      Description: Creates, updates, and deletes HelpIn service records for authorised admins
      Runtime: !Ref LambdaRuntime
      Handler: index.handler
      Role: !Ref LambdaRoleArn
      Timeout: 30
      MemorySize: !Ref LambdaMemory
      Code:
        S3Bucket:
          Fn::ImportValue: !Sub '${CoreStackName}-LambdaDeploymentBucketName'
        S3Key: !Ref AdminFunctionS3Key
      VpcConfig:
        SubnetIds:
          - Fn::ImportValue: !Sub '${CoreStackName}-PrivateAppSubnet1Id'
          - Fn::ImportValue: !Sub '${CoreStackName}-PrivateAppSubnet2Id'
        SecurityGroupIds:
          - Fn::ImportValue: !Sub '${CoreStackName}-LambdaSecurityGroupId'
      Environment:
        Variables:
          DB_HOST:
            Fn::ImportValue: !Sub '${CoreStackName}-DBEndpointAddress'
          DB_PORT:
            Fn::ImportValue: !Sub '${CoreStackName}-DBEndpointPort'
          DB_NAME:
            Fn::ImportValue: !Sub '${CoreStackName}-DBName'
          DB_SECRET_ARN:
            Fn::ImportValue: !Sub '${CoreStackName}-DBSecretArn'
          ASSETS_BUCKET:
            Fn::ImportValue: !Sub '${CoreStackName}-AssetsBucketName'
          EVENT_BUS_NAME: !Ref HelpInEventBus
          ALERT_TOPIC_ARN: !Ref HelpInAlertTopic
          REQUIRED_ADMIN_GROUP:
            Fn::ImportValue: !Sub '${CoreStackName}-CognitoAdminGroupName'
          CORS_ALLOWED_ORIGIN: !Ref CorsAllowedOrigin
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  RecommendationFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '${ProjectName}-recommendation-function'
      Description: Provides rule-based HelpIn service recommendations
      Runtime: !Ref LambdaRuntime
      Handler: index.handler
      Role: !Ref LambdaRoleArn
      Timeout: 30
      MemorySize: !Ref LambdaMemory
      Code:
        S3Bucket:
          Fn::ImportValue: !Sub '${CoreStackName}-LambdaDeploymentBucketName'
        S3Key: !Ref RecommendationFunctionS3Key
      VpcConfig:
        SubnetIds:
          - Fn::ImportValue: !Sub '${CoreStackName}-PrivateAppSubnet1Id'
          - Fn::ImportValue: !Sub '${CoreStackName}-PrivateAppSubnet2Id'
        SecurityGroupIds:
          - Fn::ImportValue: !Sub '${CoreStackName}-LambdaSecurityGroupId'
      Environment:
        Variables:
          DB_HOST:
            Fn::ImportValue: !Sub '${CoreStackName}-DBEndpointAddress'
          DB_PORT:
            Fn::ImportValue: !Sub '${CoreStackName}-DBEndpointPort'
          DB_NAME:
            Fn::ImportValue: !Sub '${CoreStackName}-DBName'
          DB_SECRET_ARN:
            Fn::ImportValue: !Sub '${CoreStackName}-DBSecretArn'
          CORS_ALLOWED_ORIGIN: !Ref CorsAllowedOrigin
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  EventProcessorFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '${ProjectName}-event-processor-function'
      Description: Processes queued HelpIn service events and operational notifications
      Runtime: !Ref LambdaRuntime
      Handler: index.handler
      Role: !Ref LambdaRoleArn
      Timeout: 60
      MemorySize: !Ref LambdaMemory
      Code:
        S3Bucket:
          Fn::ImportValue: !Sub '${CoreStackName}-LambdaDeploymentBucketName'
        S3Key: !Ref EventProcessorFunctionS3Key
      VpcConfig:
        SubnetIds:
          - Fn::ImportValue: !Sub '${CoreStackName}-PrivateAppSubnet1Id'
          - Fn::ImportValue: !Sub '${CoreStackName}-PrivateAppSubnet2Id'
        SecurityGroupIds:
          - Fn::ImportValue: !Sub '${CoreStackName}-LambdaSecurityGroupId'
      Environment:
        Variables:
          ASSETS_BUCKET:
            Fn::ImportValue: !Sub '${CoreStackName}-AssetsBucketName'
          ALERT_TOPIC_ARN: !Ref HelpInAlertTopic
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  SearchFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/lambda/${SearchFunction}'
      RetentionInDays: 30

  AdminFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/lambda/${AdminFunction}'
      RetentionInDays: 30

  RecommendationFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/lambda/${RecommendationFunction}'
      RetentionInDays: 30

  EventProcessorFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/lambda/${EventProcessorFunction}'
      RetentionInDays: 30

  HelpInEventQueueMapping:
    Type: AWS::Lambda::EventSourceMapping
    Properties:
      EventSourceArn: !GetAtt HelpInEventQueue.Arn
      FunctionName: !Ref EventProcessorFunction
      Enabled: true
      BatchSize: 10
      MaximumBatchingWindowInSeconds: 5
      FunctionResponseTypes:
        - ReportBatchItemFailures
      ScalingConfig:
        MaximumConcurrency: 2

  ############################################################
  # API Gateway + Cognito Authorizer
  ############################################################

  HelpInApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: !Sub '${ProjectName}-api'
      Description: REST API for the HelpIn platform
      EndpointConfiguration:
        Types:
          - REGIONAL
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  HelpInCognitoAuthorizer:
    Type: AWS::ApiGateway::Authorizer
    Properties:
      Name: !Sub '${ProjectName}-cognito-authorizer'
      RestApiId: !Ref HelpInApi
      Type: COGNITO_USER_POOLS
      IdentitySource: method.request.header.Authorization
      ProviderARNs:
        - !Sub
          - 'arn:${AWS::Partition}:cognito-idp:${AWS::Region}:${AWS::AccountId}:userpool/${PoolId}'
          - PoolId:
              Fn::ImportValue: !Sub '${CoreStackName}-CognitoUserPoolId'

  ServicesResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref HelpInApi
      ParentId: !GetAtt HelpInApi.RootResourceId
      PathPart: services

  ServiceIdResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref HelpInApi
      ParentId: !Ref ServicesResource
      PathPart: '{id}'

  RecommendationsResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref HelpInApi
      ParentId: !GetAtt HelpInApi.RootResourceId
      PathPart: recommendations

  ServicesGetMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref ServicesResource
      HttpMethod: GET
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${SearchFunction.Arn}/invocations'

  ServiceIdGetMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref ServiceIdResource
      HttpMethod: GET
      AuthorizationType: NONE
      RequestParameters:
        method.request.path.id: true
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${SearchFunction.Arn}/invocations'

  ServicesPostMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref ServicesResource
      HttpMethod: POST
      AuthorizationType: COGNITO_USER_POOLS
      AuthorizerId: !Ref HelpInCognitoAuthorizer
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${AdminFunction.Arn}/invocations'

  ServiceIdPutMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref ServiceIdResource
      HttpMethod: PUT
      AuthorizationType: COGNITO_USER_POOLS
      AuthorizerId: !Ref HelpInCognitoAuthorizer
      RequestParameters:
        method.request.path.id: true
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${AdminFunction.Arn}/invocations'

  ServiceIdDeleteMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref ServiceIdResource
      HttpMethod: DELETE
      AuthorizationType: COGNITO_USER_POOLS
      AuthorizerId: !Ref HelpInCognitoAuthorizer
      RequestParameters:
        method.request.path.id: true
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${AdminFunction.Arn}/invocations'

  RecommendationsGetMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref RecommendationsResource
      HttpMethod: GET
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${RecommendationFunction.Arn}/invocations'

  ServicesOptionsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref ServicesResource
      HttpMethod: OPTIONS
      AuthorizationType: NONE
      Integration:
        Type: MOCK
        RequestTemplates:
          application/json: '{"statusCode": 200}'
        IntegrationResponses:
          - StatusCode: '200'
            ResponseParameters:
              method.response.header.Access-Control-Allow-Headers: "'Content-Type,Authorization'"
              method.response.header.Access-Control-Allow-Methods: "'GET,POST,OPTIONS'"
              method.response.header.Access-Control-Allow-Origin: !Sub "'${CorsAllowedOrigin}'"
      MethodResponses:
        - StatusCode: '200'
          ResponseParameters:
            method.response.header.Access-Control-Allow-Headers: true
            method.response.header.Access-Control-Allow-Methods: true
            method.response.header.Access-Control-Allow-Origin: true

  ServiceIdOptionsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref ServiceIdResource
      HttpMethod: OPTIONS
      AuthorizationType: NONE
      Integration:
        Type: MOCK
        RequestTemplates:
          application/json: '{"statusCode": 200}'
        IntegrationResponses:
          - StatusCode: '200'
            ResponseParameters:
              method.response.header.Access-Control-Allow-Headers: "'Content-Type,Authorization'"
              method.response.header.Access-Control-Allow-Methods: "'GET,PUT,DELETE,OPTIONS'"
              method.response.header.Access-Control-Allow-Origin: !Sub "'${CorsAllowedOrigin}'"
      MethodResponses:
        - StatusCode: '200'
          ResponseParameters:
            method.response.header.Access-Control-Allow-Headers: true
            method.response.header.Access-Control-Allow-Methods: true
            method.response.header.Access-Control-Allow-Origin: true

  RecommendationsOptionsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref HelpInApi
      ResourceId: !Ref RecommendationsResource
      HttpMethod: OPTIONS
      AuthorizationType: NONE
      Integration:
        Type: MOCK
        RequestTemplates:
          application/json: '{"statusCode": 200}'
        IntegrationResponses:
          - StatusCode: '200'
            ResponseParameters:
              method.response.header.Access-Control-Allow-Headers: "'Content-Type,Authorization'"
              method.response.header.Access-Control-Allow-Methods: "'GET,OPTIONS'"
              method.response.header.Access-Control-Allow-Origin: !Sub "'${CorsAllowedOrigin}'"
      MethodResponses:
        - StatusCode: '200'
          ResponseParameters:
            method.response.header.Access-Control-Allow-Headers: true
            method.response.header.Access-Control-Allow-Methods: true
            method.response.header.Access-Control-Allow-Origin: true

  HelpInApiGatewayResponse4XX:
    Type: AWS::ApiGateway::GatewayResponse
    Properties:
      RestApiId: !Ref HelpInApi
      ResponseType: DEFAULT_4XX
      ResponseParameters:
        gatewayresponse.header.Access-Control-Allow-Origin: !Sub "'${CorsAllowedOrigin}'"
        gatewayresponse.header.Access-Control-Allow-Headers: "'Content-Type,Authorization'"

  HelpInApiGatewayResponse5XX:
    Type: AWS::ApiGateway::GatewayResponse
    Properties:
      RestApiId: !Ref HelpInApi
      ResponseType: DEFAULT_5XX
      ResponseParameters:
        gatewayresponse.header.Access-Control-Allow-Origin: !Sub "'${CorsAllowedOrigin}'"
        gatewayresponse.header.Access-Control-Allow-Headers: "'Content-Type,Authorization'"

  SearchFunctionApiPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref SearchFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub 'arn:${AWS::Partition}:execute-api:${AWS::Region}:${AWS::AccountId}:${HelpInApi}/*/*/*'

  AdminFunctionApiPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref AdminFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub 'arn:${AWS::Partition}:execute-api:${AWS::Region}:${AWS::AccountId}:${HelpInApi}/*/*/*'

  RecommendationFunctionApiPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref RecommendationFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub 'arn:${AWS::Partition}:execute-api:${AWS::Region}:${AWS::AccountId}:${HelpInApi}/*/*/*'

  HelpInApiDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - ServicesGetMethod
      - ServiceIdGetMethod
      - ServicesPostMethod
      - ServiceIdPutMethod
      - ServiceIdDeleteMethod
      - RecommendationsGetMethod
      - ServicesOptionsMethod
      - ServiceIdOptionsMethod
      - RecommendationsOptionsMethod
    Properties:
      RestApiId: !Ref HelpInApi
      Description: HelpIn API deployment

  HelpInApiStage:
    Type: AWS::ApiGateway::Stage
    Properties:
      StageName: prod
      RestApiId: !Ref HelpInApi
      DeploymentId: !Ref HelpInApiDeployment
      Tags:
        - Key: Project
          Value: !Ref ProjectName

  ############################################################
  # CloudWatch Alarms
  ############################################################

  SearchFunctionErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub '${ProjectName}-search-errors'
      AlarmDescription: Alarm when the Search Lambda reports errors
      Namespace: AWS/Lambda
      MetricName: Errors
      Dimensions:
        - Name: FunctionName
          Value: !Ref SearchFunction
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: GreaterThanOrEqualToThreshold
      TreatMissingData: notBreaching
      AlarmActions:
        - !Ref HelpInAlertTopic

  AdminFunctionErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub '${ProjectName}-admin-errors'
      AlarmDescription: Alarm when the Admin Lambda reports errors
      Namespace: AWS/Lambda
      MetricName: Errors
      Dimensions:
        - Name: FunctionName
          Value: !Ref AdminFunction
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: GreaterThanOrEqualToThreshold
      TreatMissingData: notBreaching
      AlarmActions:
        - !Ref HelpInAlertTopic

  RecommendationFunctionErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub '${ProjectName}-recommendation-errors'
      AlarmDescription: Alarm when the Recommendation Lambda reports errors
      Namespace: AWS/Lambda
      MetricName: Errors
      Dimensions:
        - Name: FunctionName
          Value: !Ref RecommendationFunction
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: GreaterThanOrEqualToThreshold
      TreatMissingData: notBreaching
      AlarmActions:
        - !Ref HelpInAlertTopic

  EventProcessorFunctionErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub '${ProjectName}-event-processor-errors'
      AlarmDescription: Alarm when the Event Processor Lambda reports errors
      Namespace: AWS/Lambda
      MetricName: Errors
      Dimensions:
        - Name: FunctionName
          Value: !Ref EventProcessorFunction
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: GreaterThanOrEqualToThreshold
      TreatMissingData: notBreaching
      AlarmActions:
        - !Ref HelpInAlertTopic

  EventQueueAgeAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub '${ProjectName}-event-queue-age'
      AlarmDescription: Alarm when HelpIn event messages remain unprocessed for too long
      Namespace: AWS/SQS
      MetricName: ApproximateAgeOfOldestMessage
      Dimensions:
        - Name: QueueName
          Value: !GetAtt HelpInEventQueue.QueueName
      Statistic: Maximum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 300
      ComparisonOperator: GreaterThanThreshold
      TreatMissingData: notBreaching
      AlarmActions:
        - !Ref HelpInAlertTopic

Outputs:

  ApiInvokeUrl:
    Description: Base URL for the HelpIn REST API
    Value: !Sub 'https://${HelpInApi}.execute-api.${AWS::Region}.amazonaws.com/prod'

  ApiId:
    Description: API Gateway REST API ID
    Value: !Ref HelpInApi

  SearchFunctionArn:
    Description: ARN of the Search Lambda function
    Value: !GetAtt SearchFunction.Arn

  AdminFunctionArn:
    Description: ARN of the Admin Lambda function
    Value: !GetAtt AdminFunction.Arn

  RecommendationFunctionArn:
    Description: ARN of the Recommendation Lambda function
    Value: !GetAtt RecommendationFunction.Arn

  EventProcessorFunctionArn:
    Description: ARN of the Event Processor Lambda function
    Value: !GetAtt EventProcessorFunction.Arn

  EventBusName:
    Description: Name of the HelpIn EventBridge event bus
    Value: !Ref HelpInEventBus

  EventQueueUrl:
    Description: URL of the HelpIn SQS event queue
    Value: !Ref HelpInEventQueue

  DeadLetterQueueUrl:
    Description: URL of the HelpIn SQS dead-letter queue
    Value: !Ref HelpInDeadLetterQueue

  AlertTopicArn:
    Description: ARN of the HelpIn SNS alert topic
    Value: !Ref HelpInAlertTopic
