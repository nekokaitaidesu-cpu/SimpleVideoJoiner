import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export async function requestMediaPermissions(): Promise<boolean> {
  const { status: pickerStatus } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (pickerStatus !== 'granted') {
    return false;
  }

  const { status: libraryStatus } =
    await MediaLibrary.requestPermissionsAsync();
  if (libraryStatus !== 'granted') {
    return false;
  }

  return true;
}
