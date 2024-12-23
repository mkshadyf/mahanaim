import { ActionIcon, Menu, Group, rem } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon
          variant="white"
          size="lg"
          aria-label={t('language.select')}
          radius="md"
        >
          <IconLanguage style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label fw={500}>{t('language.select')}</Menu.Label>
        <Menu.Item
          onClick={() => changeLanguage('en')}
          data-active={i18n.language === 'en' || undefined}
          fw={500}
        >
          <Group>
            🇺🇸 {t('language.en')}
          </Group>
        </Menu.Item>
        <Menu.Item
          onClick={() => changeLanguage('fr')}
          data-active={i18n.language === 'fr' || undefined}
          fw={500}
        >
          <Group>
            🇫🇷 {t('language.fr')}
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
} 