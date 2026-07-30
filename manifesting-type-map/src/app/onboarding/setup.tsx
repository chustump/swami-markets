import { Redirect, useRouter } from 'expo-router';

import { ArchitectSetup } from '@/components/setup/ArchitectSetup';
import { BeaconSetup } from '@/components/setup/BeaconSetup';
import { EngineSetup } from '@/components/setup/EngineSetup';
import { ProofSeekerSetup } from '@/components/setup/ProofSeekerSetup';
import { ReceiverSetup } from '@/components/setup/ReceiverSetup';
import { useAppStore } from '@/store/useAppStore';

export default function SetupScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);

  if (!profile) {
    return <Redirect href="/" />;
  }

  const onDone = () => router.replace('/home');

  switch (profile.primary) {
    case 'proof-seeker':
      return <ProofSeekerSetup onDone={onDone} />;
    case 'engine':
      return <EngineSetup onDone={onDone} />;
    case 'receiver':
      return <ReceiverSetup onDone={onDone} />;
    case 'architect':
      return <ArchitectSetup onDone={onDone} />;
    case 'beacon':
      return <BeaconSetup onDone={onDone} />;
  }
}
