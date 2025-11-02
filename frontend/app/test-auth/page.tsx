"use client";

import { useState, useEffect } from "react";
import { api, tokenManager } from "@/lib/api";
import { Button } from "@/components/ui";

/**
 * Test Auth Page
 * หน้าทดสอบ Authentication และ localStorage
 */
export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [storageData, setStorageData] = useState<any>(null);

  useEffect(() => {
    checkStorage();
  }, []);

  const addLog = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkStorage = () => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    const user = tokenManager.getUser();
    
    setStorageData({
      accessToken: accessToken ? "✅ มี" : "❌ ไม่มี",
      refreshToken: refreshToken ? "✅ มี" : "❌ ไม่มี",
      user: user || "❌ ไม่มี",
    });
  };

  const testRegister = async () => {
    addLog("🧪 เริ่มทดสอบ Register...");
    const testEmail = `test${Date.now()}@example.com`;
    const testUsername = `test${Date.now()}`;
    
    try {
      const response = await api.register({
        email: testEmail,
        password: "test1234",
        confirmPassword: "test1234",
        username: testUsername,
      });

      if (response.error) {
        addLog(`❌ Register Failed: ${response.error.message}`);
        return;
      }

      addLog(`✅ Register Success!`);
      addLog(`   Email: ${response.data?.user.email}`);
      addLog(`   Username: ${response.data?.user.username}`);
      
      // บันทึก tokens และ user
      if (response.data?.tokens) {
        tokenManager.saveTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        addLog(`✅ Tokens saved to localStorage`);
      }
      
      if (response.data?.user) {
        tokenManager.saveUser(response.data.user);
        addLog(`✅ User data saved to localStorage`);
      }
      
      checkStorage();
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  const testLogin = async () => {
    addLog("🧪 เริ่มทดสอบ Login...");
    
    try {
      const response = await api.login({
        email: "debugtest@example.com",
        password: "test1234",
      });

      if (response.error) {
        addLog(`❌ Login Failed: ${response.error.message}`);
        return;
      }

      addLog(`✅ Login Success!`);
      addLog(`   Email: ${response.data?.user.email}`);
      addLog(`   Username: ${response.data?.user.username}`);
      
      // บันทึก tokens และ user
      if (response.data?.tokens) {
        tokenManager.saveTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        addLog(`✅ Tokens saved to localStorage`);
      }
      
      if (response.data?.user) {
        tokenManager.saveUser(response.data.user);
        addLog(`✅ User data saved to localStorage`);
      }
      
      checkStorage();
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  const clearStorage = () => {
    tokenManager.clearTokens();
    addLog("🗑️ localStorage cleared");
    checkStorage();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          🧪 Test Authentication & localStorage
        </h1>

        {/* Storage Status */}
        <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            📦 localStorage Status
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Access Token: {storageData?.accessToken}</div>
            <div>Refresh Token: {storageData?.refreshToken}</div>
            <div>User Data: {typeof storageData?.user === 'object' ? JSON.stringify(storageData.user, null, 2) : storageData?.user}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStorage}
            className="mt-4"
          >
            🔄 Refresh Status
          </Button>
        </div>

        {/* Test Buttons */}
        <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            🎮 Test Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" onClick={testRegister}>
              Test Register
            </Button>
            <Button variant="primary" onClick={testLogin}>
              Test Login
            </Button>
            <Button variant="outline" onClick={clearStorage}>
              Clear Storage
            </Button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            📋 Test Results
          </h2>
          <div className="bg-background rounded-lg p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-text-tertiary">No tests run yet...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-text-secondary">
                  {result}
                </div>
              ))
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTestResults([])}
            className="mt-4"
          >
            Clear Logs
          </Button>
        </div>
      </div>
    </div>
  );
}
