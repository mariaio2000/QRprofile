// src/lib/uploadImage.ts
import { supabase } from "../../supabase/client";

/**
 * Upload a single image file (JPG, JPEG, PNG) to the database and return the image ID.
 * The image is stored as binary data in the profile_images table.
 */
export async function uploadImage(file: File, profileId: string): Promise<string> {
  console.log('uploadImage: Starting upload for profileId:', profileId);
  console.log('uploadImage: File details:', {
    name: file.name,
    size: file.size,
    type: file.type
  });
  
  if (!file || !/(jpe?g|png)$/i.test(file.type)) {
    throw new Error("Only JPG, JPEG, and PNG files are allowed.");
  }

  const MAX_MB = 10;
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`Image is too large (max ${MAX_MB}MB).`);
  }

  // Convert file to ArrayBuffer for database storage
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  console.log('uploadImage: Original file size:', file.size, 'bytes');
  console.log('uploadImage: Converted to Uint8Array size:', uint8Array.length, 'bytes');
  console.log('uploadImage: First few bytes:', Array.from(uint8Array.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(''));

  // Store binary data directly - no need for base64 conversion with BYTEA
  console.log('uploadImage: Using binary data directly, size:', uint8Array.length);

  // Prepare the insert data
  const insertData = {
    profile_id: profileId,
    image_data: uint8Array, // Store as binary data directly
    mime_type: file.type,
    file_name: file.name,
    file_size: file.size
  };
  
  console.log('uploadImage: Insert data prepared:', {
    profile_id: insertData.profile_id,
    mime_type: insertData.mime_type,
    file_name: insertData.file_name,
    file_size: insertData.file_size,
    image_data_length: insertData.image_data.length
  });

  // Insert image data into database
  console.log('uploadImage: Executing database insert...');
  const { data, error } = await supabase
    .from('profile_images')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    console.error('uploadImage: Database error:', error);
    console.error('uploadImage: Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to upload image to database: ${error.message || error.details || 'Unknown error'}`);
  }

  console.log('uploadImage: Successfully uploaded image, ID:', data.id);
  return data.id;
}

/**
 * Get image data from database by ID
 */
export async function getImageData(imageId: string): Promise<{ data: Uint8Array; mimeType: string } | null> {
  console.log('getImageData: Fetching image with ID:', imageId);
  
  const { data, error } = await supabase
    .from('profile_images')
    .select('image_data, mime_type')
    .eq('id', imageId)
    .single();

  if (error || !data) {
    console.error('Error fetching image data:', error);
    return null;
  }

  console.log('getImageData: Successfully fetched image data, size:', data.image_data?.length || 0, 'bytes');
  console.log('getImageData: Data type:', typeof data.image_data);
  console.log('getImageData: Raw data from Supabase:', {
    id: data.id,
    mime_type: data.mime_type,
    image_data_length: data.image_data?.length || 0,
    image_data_type: typeof data.image_data
  });
  
  // Handle different data types from database
  let imageData: Uint8Array;
  
  if (data.image_data instanceof Uint8Array) {
    // Already a Uint8Array - this is the correct format for BYTEA
    console.log('getImageData: Data is already Uint8Array, size:', data.image_data.length);
    imageData = data.image_data;
  } else if (Array.isArray(data.image_data)) {
    // Array of numbers - convert to Uint8Array
    console.log('getImageData: Converting array to Uint8Array, length:', data.image_data.length);
    imageData = new Uint8Array(data.image_data);
  } else if (typeof data.image_data === 'string') {
    // String data - might be base64 encoded, hex, or JSON object
    console.log('getImageData: Converting string data to Uint8Array');
    console.log('getImageData: String data length:', data.image_data.length);
    console.log('getImageData: String data preview:', data.image_data.substring(0, 100) + '...');
    console.log('getImageData: String data last 50 chars:', data.image_data.substring(data.image_data.length - 50));
    
    // Check if it's a JSON object (Supabase sometimes returns BYTEA as JSON)
    if (data.image_data.startsWith('\\x7b22')) {
      console.log('getImageData: Detected JSON format, trying to parse...');
      try {
        // Remove the \x prefix and decode hex to get the JSON string
        const hexString = data.image_data.replace(/\\x/g, '');
        
        // Process hex string in chunks to avoid call stack issues
        const jsonString = decodeHexInChunks(hexString);
        console.log('getImageData: JSON string preview:', jsonString.substring(0, 100) + '...');
        
        // Parse the JSON object
        const jsonData = JSON.parse(jsonString);
        console.log('getImageData: Parsed JSON, keys count:', Object.keys(jsonData).length);
        
        // Convert JSON object back to Uint8Array more efficiently
        const keys = Object.keys(jsonData).map(k => parseInt(k)).sort((a, b) => a - b);
        const maxKey = keys[keys.length - 1];
        imageData = new Uint8Array(maxKey + 1);
        
        // Fill the array with the JSON data
        for (const key of keys) {
          imageData[key] = jsonData[key.toString()];
        }
        
        console.log('getImageData: Successfully converted JSON to Uint8Array, size:', imageData.length);
        console.log('getImageData: First 10 bytes:', Array.from(imageData.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
        return {
          data: imageData,
          mimeType: data.mime_type
        };
      } catch (jsonError) {
        console.error('getImageData: Failed to parse JSON:', jsonError);
      }
    }
    
    // Try to decode as base64 first (this is our new format)
    try {
      const binaryString = atob(data.image_data);
      imageData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imageData[i] = binaryString.charCodeAt(i);
      }
      console.log('getImageData: Successfully decoded as base64, size:', imageData.length);
      console.log('getImageData: Decoded first 10 bytes:', Array.from(imageData.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    } catch (e) {
      console.log('getImageData: Not base64, trying hex decode...');
      
      // Try to decode as hex string (Supabase seems to be storing base64 as hex)
      try {
        // Remove the \x prefix and decode hex
        const hexString = data.image_data.replace(/\\x/g, '');
        if (hexString.length % 2 !== 0) {
          throw new Error('Invalid hex string length');
        }
        
        imageData = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
          imageData[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
        console.log('getImageData: Successfully decoded as hex, size:', imageData.length);
      } catch (hexError) {
        console.log('getImageData: Not hex, trying escaped binary...');
        
        // Try to handle escaped binary data (common in PostgreSQL)
        try {
          const unescaped = data.image_data
            .replace(/\\x/g, '')
            .replace(/\\\\/g, '\\')
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t');
          
          imageData = new Uint8Array(unescaped.length);
          for (let i = 0; i < unescaped.length; i++) {
            imageData[i] = unescaped.charCodeAt(i);
          }
          console.log('getImageData: Successfully decoded as escaped binary');
        } catch (escapeError) {
          console.error('getImageData: Failed to decode string data:', {
            base64Error: e,
            hexError: hexError,
            escapeError: escapeError
          });
          return null;
        }
      }
    }
  } else {
    console.error('getImageData: Unexpected data type:', typeof data.image_data);
    return null;
  }
  
  console.log('getImageData: Converted to Uint8Array, size:', imageData.length, 'bytes');
  
  return {
    data: imageData,
    mimeType: data.mime_type
  };
}

/**
 * Delete image from database by ID
 */
export async function deleteImage(imageId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profile_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
}

/**
 * Convert image data to blob URL for display
 */
export function imageDataToBlobUrl(imageData: Uint8Array, mimeType: string): string {
  console.log('imageDataToBlobUrl: Creating blob with size:', imageData.length, 'bytes, mimeType:', mimeType);
  
  // Validate the data
  if (!imageData || imageData.length === 0) {
    console.error('imageDataToBlobUrl: Empty or invalid image data');
    throw new Error('Invalid image data');
  }
  
  // Check if the data looks like a valid image (should start with image magic bytes)
  const firstBytes = Array.from(imageData.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('imageDataToBlobUrl: First 4 bytes:', firstBytes);
  
  // Validate image magic bytes
  const jpegMagic = 'ffd8ff';
  const pngMagic = '89504e47';
  
  if (!firstBytes.startsWith(jpegMagic) && !firstBytes.startsWith(pngMagic)) {
    console.error('imageDataToBlobUrl: Invalid image magic bytes:', firstBytes);
    console.error('imageDataToBlobUrl: Expected JPEG (ffd8ff) or PNG (89504e47)');
  }
  
  const blob = new Blob([imageData], { type: mimeType });
  console.log('imageDataToBlobUrl: Blob created, size:', blob.size, 'bytes');
  
  // Test if blob is valid by reading it
  const reader = new FileReader();
  reader.onload = () => {
    console.log('imageDataToBlobUrl: Blob read successfully, size:', reader.result?.toString().length || 0);
  };
  reader.onerror = () => {
    console.error('imageDataToBlobUrl: Failed to read blob:', reader.error);
  };
  reader.readAsArrayBuffer(blob);
  
  const url = URL.createObjectURL(blob);
  console.log('imageDataToBlobUrl: Created blob URL:', url);
  return url;
}

/**
 * Helper function to decode hex string in chunks to avoid call stack issues
 */
function decodeHexInChunks(hexString: string): string {
  const chunkSize = 8192; // Process in chunks
  let result = '';
  
  for (let i = 0; i < hexString.length; i += chunkSize * 2) {
    const chunk = hexString.slice(i, i + chunkSize * 2);
    const bytes = chunk.match(/.{1,2}/g) || [];
    const chunkString = String.fromCharCode(...bytes.map(byte => parseInt(byte, 16)));
    result += chunkString;
  }
  
  return result;
}

/**
 * Test function to verify database connection and table access
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('testDatabaseConnection: Testing database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('testDatabaseConnection: Error accessing profiles table:', testError);
      return false;
    }
    
    console.log('testDatabaseConnection: Successfully accessed profiles table');
    
    // Test profile_images table
    const { data: imageData, error: imageError } = await supabase
      .from('profile_images')
      .select('id')
      .limit(1);
    
    if (imageError) {
      console.error('testDatabaseConnection: Error accessing profile_images table:', imageError);
      return false;
    }
    
    console.log('testDatabaseConnection: Successfully accessed profile_images table');
    
    // Test the table structure
    const { data: structureData, error: structureError } = await supabase
      .from('profile_images')
      .select('image_data')
      .limit(1);
    
    if (structureError) {
      console.error('testDatabaseConnection: Error testing table structure:', structureError);
      return false;
    }
    
    if (structureData && structureData.length > 0) {
      const sample = structureData[0];
      console.log('testDatabaseConnection: Sample image_data type:', typeof sample.image_data);
      console.log('testDatabaseConnection: Sample image_data length:', sample.image_data?.length || 0);
    }
    
    console.log('testDatabaseConnection: Database connection test passed');
    return true;
    
  } catch (error) {
    console.error('testDatabaseConnection: Unexpected error:', error);
    return false;
  }
}

/**
 * Test base64 encoding/decoding with a small sample
 */
export function testBase64Encoding(): boolean {
  try {
    console.log('testBase64Encoding: Testing base64 encoding/decoding...');
    
    // Create a small test image data (PNG header)
    const testData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D
    ]);
    
    console.log('testBase64Encoding: Original data:', Array.from(testData).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...testData));
    console.log('testBase64Encoding: Base64 encoded:', base64);
    
    // Decode back
    const decoded = atob(base64);
    const decodedArray = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      decodedArray[i] = decoded.charCodeAt(i);
    }
    
    console.log('testBase64Encoding: Decoded data:', Array.from(decodedArray).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // Compare
    const isEqual = testData.length === decodedArray.length && 
                   testData.every((val, index) => val === decodedArray[index]);
    
    console.log('testBase64Encoding: Round-trip successful:', isEqual);
    return isEqual;
    
  } catch (error) {
    console.error('testBase64Encoding: Error:', error);
    return false;
  }
}

/**
 * Test uploading a small image to the database
 */
export async function testImageUpload(): Promise<boolean> {
  try {
    console.log('testImageUpload: Testing image upload...');
    
    // Create a small test PNG file
    const pngData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const testFile = new File([pngData], 'test.png', { type: 'image/png' });
    
    // Get a profile ID to test with
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (!profiles || profiles.length === 0) {
      console.error('testImageUpload: No profiles found to test with');
      return false;
    }
    
    const profileId = profiles[0].id;
    console.log('testImageUpload: Using profile ID:', profileId);
    
    // Upload the test image
    const imageId = await uploadImage(testFile, profileId);
    console.log('testImageUpload: Uploaded test image with ID:', imageId);
    
    // Retrieve the image
    const imageData = await getImageData(imageId);
    if (!imageData) {
      console.error('testImageUpload: Failed to retrieve test image');
      return false;
    }
    
    console.log('testImageUpload: Retrieved image data, size:', imageData.data.length);
    console.log('testImageUpload: Retrieved first 10 bytes:', Array.from(imageData.data.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    console.log('testImageUpload: Original first 10 bytes:', Array.from(pngData.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // Compare with original
    const isEqual = pngData.length === imageData.data.length && 
                   pngData.every((val, index) => val === imageData.data[index]);
    
    console.log('testImageUpload: Round-trip successful:', isEqual);
    
    // Clean up test image
    await deleteImage(imageId);
    console.log('testImageUpload: Cleaned up test image');
    
    return isEqual;
    
  } catch (error) {
    console.error('testImageUpload: Error:', error);
    return false;
  }
}

/**
 * Clean up corrupted image data from the database
 */
export async function cleanupCorruptedImages(): Promise<number> {
  try {
    console.log('cleanupCorruptedImages: Starting cleanup...');
    
    // Get all image records
    const { data: images, error } = await supabase
      .from('profile_images')
      .select('id, image_data, mime_type, file_name');
    
    if (error) {
      console.error('cleanupCorruptedImages: Error fetching images:', error);
      return 0;
    }
    
    let deletedCount = 0;
    
    for (const image of images || []) {
      let shouldDelete = false;
      
      // Check if data is corrupted (stored as JSON string or array)
      if (typeof image.image_data === 'string') {
        // Check if it's valid base64 (should start with valid base64 characters)
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(image.image_data) || image.image_data.length < 100) {
          console.log('cleanupCorruptedImages: Found invalid base64 data for image:', image.id);
          shouldDelete = true;
        } else {
          // Try to decode to see if it's valid
          try {
            atob(image.image_data);
            console.log('cleanupCorruptedImages: Valid base64 data for image:', image.id);
          } catch (e) {
            console.log('cleanupCorruptedImages: Invalid base64 data for image:', image.id);
            shouldDelete = true;
          }
        }
      } else if (Array.isArray(image.image_data)) {
        // Check if it's a small array (likely JSON)
        if (image.image_data.length < 100) {
          console.log('cleanupCorruptedImages: Found small array data for image:', image.id);
          shouldDelete = true;
        } else {
          // Check if it looks like JSON
          const firstFew = image.image_data.slice(0, 10);
          const asString = String.fromCharCode(...firstFew);
          if (asString.startsWith('{') || asString.startsWith('[')) {
            console.log('cleanupCorruptedImages: Found JSON-like data for image:', image.id);
            shouldDelete = true;
          }
        }
      }
      
      if (shouldDelete) {
        console.log('cleanupCorruptedImages: Deleting corrupted image:', image.id);
        const { error: deleteError } = await supabase
          .from('profile_images')
          .delete()
          .eq('id', image.id);
        
        if (deleteError) {
          console.error('cleanupCorruptedImages: Error deleting image:', deleteError);
        } else {
          deletedCount++;
        }
      }
    }
    
    console.log('cleanupCorruptedImages: Cleanup completed, deleted', deletedCount, 'corrupted images');
    return deletedCount;
    
  } catch (error) {
    console.error('cleanupCorruptedImages: Unexpected error:', error);
    return 0;
  }
}

/**
 * Test function to verify RLS policies work correctly
 */
export async function testRLSPolicies(): Promise<boolean> {
  console.log('Testing RLS policies...');
  
  try {
    // Test 1: Try to insert an image (should work for authenticated users with valid profile)
    const testFile = new File(['test'], 'test.png', { type: 'image/png' });
    const testResult = await testImageUpload();
    
    if (!testResult) {
      console.error('RLS test failed: Image upload test failed');
      return false;
    }
    
    console.log('RLS test passed: Image upload works correctly');
    return true;
  } catch (error) {
    console.error('RLS test failed:', error);
    return false;
  }
}
