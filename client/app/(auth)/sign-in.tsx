import { COLORS } from "@/constants";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await signIn.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === "needs_client_trust") {
      // For other second factor strategies,
      // see https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
      setLoading(false);
    } else {
      // Check why the sign-in is not complete
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else {
      // Check why the sign-in is not complete
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center px-7 py-8">
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-primary mb-2">
            Verify Email
          </Text>
          <Text className="text-secondary text-center">
            Enter the code sent to your email
          </Text>
        </View>

        <View className="mb-6">
          <TextInput
            className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest"
            placeholder="123456"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={code}
            onChangeText={(code) => setCode(code)}
          />
        </View>
        {errors.fields.code && (
          <Text style={{ color: "#d32f2f", fontSize: 12, marginTop: -8 }}>
            {errors.fields.code.message}
          </Text>
        )}
        <TouchableOpacity
          className="w-full bg-primary py-4 rounded-full items-center"
          onPress={handleVerify}
          disabled={loading || !code || fetchStatus === "fetching"}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Verify</Text>
          )}
        </TouchableOpacity>

        <Pressable
          style={({ pressed }) => [
            {
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 10,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => signIn.mfa.sendEmailCode()}
        >
          <Text className="text-[#0a7ea4] font-bold">I need a new code</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            {
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 10,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => signIn.reset()}
        >
          <Text className="text-[#0a7ea4] font-bold">Start over</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-7 py-8">
      <TouchableOpacity
        onPress={() => router.push("/")}
        className="absolute top-12 z-10"
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-primary mb-2">
          Welcome Back
        </Text>
        <Text className="text-secondary text-lg">Sign in to continue</Text>
      </View>

      <View className="mb-4">
        <Text className="text-primary font-medium mb-2">Email</Text>
        <TextInput
          className="w-full bg-surface p-4 rounded-xl text-primary"
          placeholder="user@example.com"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />
      </View>

      <View className="mb-6">
        <Text className="text-primary font-medium mb-2">Password</Text>
        <TextInput
          className="w-full bg-surface p-4 rounded-xl text-primary"
          placeholder="********"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <Pressable
        className={`w-full py-4 rounded-full items-center mb-10 ${loading || !emailAddress || !password ? "bg-gray-300" : "bg-primary"}`}
        onPress={handleSubmit}
        disabled={
          loading || !emailAddress || !password || fetchStatus === "fetching"
        }
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Sign In</Text>
        )}
      </Pressable>

      <View className="flex-row justify-center">
        <Text className="text-secondary">{"Don't have an account?"}</Text>
        <Link href="/sign-up">
          <Text className="text-primary font-bold">Sign up</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}