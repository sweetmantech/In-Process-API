import { describe, it, expect, vi, beforeEach } from 'vitest';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';

vi.mock('@/lib/arweave/fetchUri');
import fetchUri from '@/lib/arweave/fetchUri';

const CATALOG_RAW = {
  animation_url: 'ar://meZC1iVTnX20tCsYymQ4JmOOAedj3S0ycvcmVrQzmnk',
  artist: 'Dutchyyy',
  artwork: {
    uri: 'ar://lIpA-cdqT8Al9ByspOmnXL3oov__wR_qn76FoS3VZww',
    mimeType: 'image/jpeg',
  },
  description: 'Thank You Catalog Works',
  duration: 383.582,
  external_url: 'https://catalog.works/steal-the-moon-to-save-the-sun',
  image: 'ar://lIpA-cdqT8Al9ByspOmnXL3oov__wR_qn76FoS3VZww',
  losslessAudio: 'ipfs://QmSDQpfFbNMRE4q91Gw9VkBr4pWv42TMq6PZ6km8a3MBcc',
  mimeType: 'audio/wav',
  name: 'Forever, EVER? - Steal the moon to save the sun',
  title: 'Steal the moon to save the sun',
  version: 'catalog-20220222',
};

const SOUND_RAW = {
  animation_url: 'ar://zNYBQ0H9a9lcsX_tnaeq7RA4Ntft7Mhvptmg1P9RY9Y',
  artist: 'Yoshiro Mare',
  artwork: {
    mimeType: 'image/png',
    uri: 'ar://kGOBdvs_wB93kPK9DtuifQ3yCKQLG5toZmHURsDfZz0',
    nft: null,
  },
  attributes: [
    { trait_type: 'Malibu ft. CG Prod.', value: 'Song Edition' },
    { trait_type: 'Tier', value: 'Limited' },
  ],
  description: 'Malibu, California Beach Portal...',
  duration: 350,
  external_url: 'https://www.sound.xyz/yoshiromare/malibu-ft-cg-prod',
  genre: 'Electronic',
  image: 'ar://kGOBdvs_wB93kPK9DtuifQ3yCKQLG5toZmHURsDfZz0',
  losslessAudio: 'ar://zNYBQ0H9a9lcsX_tnaeq7RA4Ntft7Mhvptmg1P9RY9Y',
  mimeType: 'audio/wave',
  name: 'Malibu ft. CG Prod. - Limited #1',
  title: 'Malibu ft. CG Prod.',
  version: 'sound-edition-20220930',
};

beforeEach(() => {
  vi.mocked(fetchUri).mockResolvedValue({
    headers: { get: vi.fn().mockReturnValue(null) },
  } as unknown as Response);
});

describe('normalizeMetadata', () => {
  describe('name', () => {
    it('prefers title over name', async () => {
      const result = await normalizeMetadata(CATALOG_RAW);
      expect(result.name).toBe('Steal the moon to save the sun');
    });

    it('falls back to name when title is absent', async () => {
      const result = await normalizeMetadata({ name: 'Only Name' });
      expect(result.name).toBe('Only Name');
    });
  });

  describe('image', () => {
    it('uses raw.image when present', async () => {
      const result = await normalizeMetadata(CATALOG_RAW);
      expect(result.image).toBe(
        'ar://lIpA-cdqT8Al9ByspOmnXL3oov__wR_qn76FoS3VZww'
      );
    });

    it('falls back to artwork.uri when image is absent', async () => {
      const result = await normalizeMetadata({
        name: 'Test',
        artwork: { uri: 'ar://artwork-uri', mimeType: 'image/png' },
      });
      expect(result.image).toBe('ar://artwork-uri');
    });

    it('omits image when neither image nor artwork.uri is present', async () => {
      const result = await normalizeMetadata({ name: 'Test' });
      expect(result.image).toBeUndefined();
    });
  });

  describe('animation_url / content', () => {
    it('uses animation_url when non-empty (catalog)', async () => {
      const result = await normalizeMetadata(CATALOG_RAW);
      expect(result.animation_url).toBe(
        'ar://meZC1iVTnX20tCsYymQ4JmOOAedj3S0ycvcmVrQzmnk'
      );
    });

    it('sets content from mimeType + animation_url (catalog)', async () => {
      const result = await normalizeMetadata(CATALOG_RAW);
      expect(result.content).toEqual({
        mime: 'audio/wav',
        uri: 'ar://meZC1iVTnX20tCsYymQ4JmOOAedj3S0ycvcmVrQzmnk',
      });
    });

    it('falls back to losslessAudio when animation_url is empty string', async () => {
      const result = await normalizeMetadata({
        ...SOUND_RAW,
        animation_url: '',
      });
      expect(result.animation_url).toBe(
        'ar://zNYBQ0H9a9lcsX_tnaeq7RA4Ntft7Mhvptmg1P9RY9Y'
      );
      expect(result.content).toEqual({
        mime: 'audio/wave',
        uri: 'ar://zNYBQ0H9a9lcsX_tnaeq7RA4Ntft7Mhvptmg1P9RY9Y',
      });
    });

    it('omits animation_url and content when both animation_url and losslessAudio are absent', async () => {
      const result = await normalizeMetadata({ name: 'Test' });
      expect(result.animation_url).toBeUndefined();
      expect(result.content).toBeUndefined();
    });

    it('prefers explicit content field over derived', async () => {
      const explicit = { mime: 'audio/mp3', uri: 'ar://explicit' };
      const result = await normalizeMetadata({
        ...CATALOG_RAW,
        content: explicit,
      });
      expect(result.content).toEqual(explicit);
    });

    it('fetches animation_url HEAD to detect mime when no mimeType and no explicit content', async () => {
      vi.mocked(fetchUri).mockResolvedValueOnce({
        headers: { get: vi.fn().mockReturnValue('video/mp4; codecs=avc1') },
      } as unknown as Response);

      const result = await normalizeMetadata({
        name: 'Test',
        animation_url: 'ar://some-video-hash',
      });
      expect(fetchUri).toHaveBeenCalledWith('ar://some-video-hash', {
        method: 'HEAD',
      });
      expect(result.content).toEqual({
        mime: 'video/mp4',
        uri: 'ar://some-video-hash',
      });
    });

    it('omits content when animation_url HEAD fetch fails', async () => {
      vi.mocked(fetchUri).mockRejectedValueOnce(new Error('network error'));

      const result = await normalizeMetadata({
        name: 'Test',
        animation_url: 'ar://some-hash',
      });
      expect(result.content).toBeUndefined();
    });

    it('falls back to imageUri when animationUri is absent', async () => {
      vi.mocked(fetchUri).mockResolvedValueOnce({
        headers: { get: vi.fn().mockReturnValue('image/png') },
      } as unknown as Response);

      const result = await normalizeMetadata({
        name: 'Test',
        image: 'ar://some-image-hash',
      });
      expect(fetchUri).toHaveBeenCalledWith('ar://some-image-hash', {
        method: 'HEAD',
      });
      expect(result.content).toEqual({
        mime: 'image/png',
        uri: 'ar://some-image-hash',
      });
    });

    it('omits content when animation_url HEAD returns no content-type', async () => {
      vi.mocked(fetchUri).mockResolvedValueOnce({
        headers: { get: vi.fn().mockReturnValue(null) },
      } as unknown as Response);

      const result = await normalizeMetadata({
        name: 'Test',
        animation_url: 'ar://some-hash',
      });
      expect(result.content).toBeUndefined();
    });
  });

  describe('attributes', () => {
    it('includes raw attributes (sound.xyz)', async () => {
      const result = await normalizeMetadata(SOUND_RAW);
      expect(result.attributes).toEqual(
        expect.arrayContaining([
          { trait_type: 'Malibu ft. CG Prod.', value: 'Song Edition' },
          { trait_type: 'Tier', value: 'Limited' },
        ])
      );
    });

    it('appends genre as Genres attribute (string → array)', async () => {
      const result = await normalizeMetadata(SOUND_RAW);
      expect(result.attributes).toEqual(
        expect.arrayContaining([
          { trait_type: 'Genres', value: ['Electronic'] },
        ])
      );
    });

    it('keeps genre as array when already an array', async () => {
      const result = await normalizeMetadata({
        ...SOUND_RAW,
        genre: ['Electronic', 'Techno'],
      });
      expect(result.attributes).toEqual(
        expect.arrayContaining([
          { trait_type: 'Genres', value: ['Electronic', 'Techno'] },
        ])
      );
    });

    it('omits attributes when none present and no genre', async () => {
      const result = await normalizeMetadata(CATALOG_RAW);
      expect(result.attributes).toBeUndefined();
    });

    it('includes Genres-only attributes when raw.attributes is absent', async () => {
      const result = await normalizeMetadata({ name: 'Test', genre: 'Jazz' });
      expect(result.attributes).toEqual([
        { trait_type: 'Genres', value: ['Jazz'] },
      ]);
    });
  });

  describe('optional fields', () => {
    it('includes external_url when present', async () => {
      const result = await normalizeMetadata(CATALOG_RAW);
      expect(result.external_url).toBe(
        'https://catalog.works/steal-the-moon-to-save-the-sun'
      );
    });

    it('includes description when present', async () => {
      const result = await normalizeMetadata(CATALOG_RAW);
      expect(result.description).toBe('Thank You Catalog Works');
    });

    it('omits external_url when absent', async () => {
      const result = await normalizeMetadata({ name: 'Test' });
      expect(result.external_url).toBeUndefined();
    });
  });

  describe('no artwork key in output', () => {
    it('does not include artwork field', async () => {
      const result = await normalizeMetadata(CATALOG_RAW);
      expect(result).not.toHaveProperty('artwork');
    });

    it('does not include artwork field for sound.xyz', async () => {
      const result = await normalizeMetadata(SOUND_RAW);
      expect(result).not.toHaveProperty('artwork');
    });
  });
});
