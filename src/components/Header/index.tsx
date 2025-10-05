import { A } from '@solidjs/router';
import OpenAQIcon from '~/assets/imgs/logo.svg';
import '~/assets/scss/components/header.scss';

export function Header() {
  return (
    <header class="header">
      <div class="header-contents">
        <A
          href="https://openaq.org"
          class="header-logo"
          aria-label="openaq logo"
        >
          <OpenAQIcon height={40} width={72} />
        </A>
      </div>
    </header>
  );
}
