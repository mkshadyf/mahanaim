import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { IconFlag, IconFlagFilled } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface LanguageSwitcherProps {
  variant?: 'icon' | 'text' | 'dropdown';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function LanguageSwitcher({
  variant = 'icon',
  size = 'md',
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = useMemo(() => {
    return i18n.language?.startsWith('fr') ? 'fr' : 'en';
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    // Store language preference
    localStorage.setItem('preferredLanguage', newLang);
  };

  if (variant === 'dropdown') {
    return (
      <Menu position="bottom-end" withArrow>
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            size={size}
            aria-label={t('language.select')}
          >
            {currentLanguage === 'fr' ? (
              <IconFlagFilled size="1.2rem" />
            ) : (
              <IconFlag size="1.2rem" />
            )}
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{t('language.select')}</Menu.Label>
          <Menu.Item
            onClick={() => i18n.changeLanguage('en')}
            data-active={currentLanguage === 'en' || undefined}
          >
            {t('language.en')}
          </Menu.Item>
          <Menu.Item
            onClick={() => i18n.changeLanguage('fr')}
            data-active={currentLanguage === 'fr' || undefined}
          >
            {t('language.fr')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  }

  if (variant === 'text') {
    return (
      <ActionIcon
        variant="subtle"
        onClick={toggleLanguage}
        aria-label={t('language.select')}
      >
        {currentLanguage === 'fr' ? 'FR' : 'EN'}
      </ActionIcon>
    );
  }

  // Default icon variant
  return (
    <Tooltip label={t('language.select')}>
      <ActionIcon
        variant="subtle"
        onClick={toggleLanguage}
        size={size}
        aria-label={t('language.select')}
      >
        {currentLanguage === 'fr' ? (
          <IconFlagFilled size="1.2rem" />
        ) : (
          <IconFlag size="1.2rem" />
        )}
      </ActionIcon>
    </Tooltip>
  );
} 