#!/bin/sed -urf
# -*- coding: UTF-8, tab-width: 2 -*-

/^[A-Z]: /!{
  s~ [0-9.]*[1-9][0-9]*$~ <non-zero>~
}
