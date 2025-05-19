import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { testPublicUsersApi, PublicUsersResponse } from '@/services/api-tester/publicUserApi';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function PublicUserApiTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: PublicUsersResponse;
  } | null>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const testResult = await testPublicUsersApi();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Public Users API Test</CardTitle>
        <CardDescription>
          Test the public users API endpoint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Public Users API'
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {result.success ? 'Success' : 'Error'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{result.message}</p>
                </div>
              </div>
              
              {result.success && result.data && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Sample Data:</p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border text-xs overflow-auto max-h-60">
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Endpoint: /api/public/users
      </CardFooter>
    </Card>
  );
}

export default PublicUserApiTester;
