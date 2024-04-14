const SearchOutlinedBase =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAA0lJREFUSEu91k9oHFUcwPHvb7abP0Zp0RpE9CBRNJfebP0HomDVHir1EK0HUUo7uzuzu5MtGtAiwYCg0c0mmUlmU3pQQUugpVEr6E2qsUqvKoq00AotxMCCmMW0Mz+dTat2u7uzLMZ3ffPe5/fe+/3eG+F/btKONzU11Q3dtwWG9iNBZbWn55eRPXt+a2ds/TctwUl3dhfIiwqPAT3/GhyCnhSVw6Krc7lc7o928YZg0fPuNMLE+wj3AZeAL1U4ZYS6hMgmhXtYC+J64KwhsjdnmZ+3g14DlrzyQ6guAJtQ/KQRjFmWdaF+smKx2Gt09dmgB4A+RbLDtjkbh14F1lamiW+ApBqyezhjHo+boDQzczdh4hPQAYFdeTsVBdu0XQWWpv2vEbaqITvbwa7MOj198I5Agm+jQDdwacC27eVm4t9glCCKHEWZcbIpK25l9f0Tnr9blA8Eink7tb8N0P9I4cmkBLc3OrO4AFRVJr2570BvvrX/xluGhoaCRmNqK4zqLDS6KsBJx049Ejd5s/6S64/9ldUHRIwH89a+xRZgeSA09GcV3h62Ui91Ck66/lMKxwR5IW+b7zYFJ1z/foFFUR3JZ9NvdQx6cw+ohl+BvOzY5nhz0PMGRRPfg77h2OlXOwZdf4fCcUT3OVb6YFPwzUOHbuiuXozOcMGxU093Ck64fkHgHVSfcLLpz5qCUUfJnY22Yku4utJfKBSqnaAl1/8CuLc3KZtN01xpCU5O+1kVplrtf6sgruQByodONvVcbB1eLo2faneoEW51Mpkf213l+Ph7fcne6mJ0vQUSDO63rHOxYK0evfL2UPVThNOJMPF4Nrv3TBy6hq3MAzva2Z1rXosJt5wW1AOWVcg5GfOwiGgjeG0bxQfdUutXjlaWLzwzOjoaPWkNW8P38HIBR4W7EeQH0CMCpxBjKQzZiISDqO4UkYeB34HohtkOPBqHNn3xXde9KWDDKwrPA5sbhFtFORYYwUh0ZuVy+brqRf24hiJHKr+ef7bRSmP/aebn5xPnlyrbUL1LoR8JK4Sc7e0yTtSnfjtoLBiXNPX9ceh/DkYBtELXBWyFrhtYj4rIa3nLHFtX8B80fD0MdaGQy5xYd7A+qf4EP/GCLIVr7DEAAAAASUVORK5CYII=";

const DeleteOutlinedBase =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAYdJREFUSEvtlr9PwkAUx78HFGUQQ21lYXDQxLg6mZDQRCOzi/+Hk+I5XGIa2PxDGJwdSEoc3NwwBowTC7YpUQctv2pKUgKhcEVQlt50ufve+7x39+7eEfxzI354kkI7AMIcbdPQVJFnbzlAKUMrUz0j2HPmDbkaQbHYHdaupy8SQiRswkYPwPNEOwQVQ1NP+xFKCrV5W8EF8gzYeDTK6n4fKB7m+hHwmlnKP41pGAuJ99Yub60A+7tRKrz6OkOesVnmlweMZ5kYtdp3xIapl9XsLF5P0krK5S1AUj0IJ6bG6o5uEGHymG12W+0GbLwZZTXpGpEVmnf6uqbm3LENhV6HgIguV6/crPXSSQqtAdgm6O7oWuHFF9DNYENTB85JGWqBIGrIwgqKrDWc6SO6AOh1hsGWBkkT3MOxpy24Fgu/FqmDs5jzONcfbr7carGlsNWO9U6Gx7x0v6oW89RFf0DA+VB9zAMarLWxBoLQ9Hq4ENKoEU+gU/0TR+fxP+ChmY59gjHn34of/2QOO3koOmMAAAAASUVORK5CYII=";

const QuestionCircleOutlinedBase =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAA8tJREFUSEu9Vl1sFFUU/s6dXWAJRIGKUIygEODF4E9MJNH4k/igxh+CboD4INJ2h+7sdJcm8uLPoCbGRLvT3ZnubCvZF4NJLQFJ1AcSjSGGJiSiPlGMscZSA1aogSDbdueYu91ttrPT3YWYnce559zvnu9837mX0MCXSmUecAW9BOAxAtYx0CrTCBhn4AKAU8Ll47q+/2y97ahWQNJ2XibG+wC21NuotD7ChDcTUXVooXhfwHR64J4CCkdAeKSUOEbAFy6LL13Cr0toelz+v8HBVsHYKMh9joEXAdxVjGcMK1D2xGLtv3mBqwBTff2Pu657FMAqgCRl76xbvSIXDocLtaocHBxULly6speAQwBLyv8WQuzUOzu+q8ybB1gCOwkgCNCJfCjw6sF9+642SGcx7MPDh5cv/nfmU4BfADAthHi6EnQOsEgjFc7MVsapyYmLCcMw3JsBK8cahiFua1ljEhCTlSqsPFymdw7QTDunZ3tGJyYn/tzhB5bNZpfemOJ2JmwDsB6MMQg+IwrTA7qu5ysPJ0Fvb1l7rFgpYzgeU7eXlA2U1Pi57Fk+FNjqR2NvX99D7IpBAPcCGCXCH8y0sdSvUYWVp7wiKdF7TsYw4RWp3mKFpuWck9JnUHtCi3zipTGXyy3553r+ZzDWELCrS1O/kjHFKu5Y+waYPwDwfVxTH/XmJq1sG4EHAIzENXUrlUz9A4Cx1tUrN/ipMWlnXiOmHIC34poqfTnvS1rOjwRsc6cCqw4caLtcuSjVO37p8qi0jHD5QTIt5xCAtwmwuzRV8xOJaWU+AqhbCHe73tk57I0xrewQwDuFi/t1Xf3Ju95rORYDUQDvSsBvADzJLJ5NxDq+9gPsse1NAaIWzMyc9Yqjp6cnJBYt/QXAnflQcKVf/5Pp/meIXNmGb6nXckYY2FyA2NKtdZy/GRvM0nVFem4XA+mEpup++R9b/ZsVuCMEnJcVSmMvC1JheTQavdYoYCqVWuyKRZ8B2AHQ0cmJFXsMIzzll2/b9rJpViTOtVsCZGbqtfuPz3qMrC6tQyciXuiwFYBXb4nSpO3sJsYRAob0aCRcC0wewktpXdFUqy4zwKA2IcQT3uHsV+U80TRiiyrf2Y5JjPtCQXo+Eolcr9f3ebZoxPj1Nqy1XmX8RkZbVYXpjAHCBpoJHIzH2y/WAqwabTK4keFd3tQ0s3cjwL8XJz9jf1dMdRYCXHB4F6ts4HqaA7Wc9xi0XnGD3br++l9+gDWvJ5nQ9AtYgjb1iVGmpamPqDJoU5+JlQJo2kPYq7r/86n/H9kZNwrJVy0tAAAAAElFTkSuQmCC";

const ArrowCircleDownOutlinedBase =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAA2tJREFUSEu9lu9vDGsUx79n5pnsYlVCIlJeEKGN+JErIUhERfyoBre7nW0jXpC48cKV8P7mGuIPQHiDxAs/d7edalEvXEpErly5P3iBEkGCeKFxo8XWPDNHnt0Z6dbu7FZk59Vm55zzmXOe833OIVTwGG3tPzFrP4OxHMBUALW+22sAr0C4ReRdcM63/FsuHIUZ6GZHCxEdAFBXLpD/vo+Zf3MzifZS9kWBUbN7hiR5FsAS3/ElA10guizAT4c8qTJDRBO1EjQTzE0EbAIwzbe/I1hszmY2PhsJ/gYoTHsFCB0AJgF4TcR7Hc89iUzSDc3STOuGpm9jpn1+yfvBSMhM/OZwvwKgD7sKwADQLbP6FnRvGqiwnHmzjV3jRdQ9rX4BcMBYPRz6FeiX8a6f2WE55/4eWJY3KlhgbFma/mDBQQLvAtAvWCwKyvsVKJL2n/6Zdcs595vLwixLC7WxLE08mN/pZ3pHpuNL1ffkgH43ZtSZyaxeH1pGMz1FkLjChBohvXVDHS1PSlYhX95H6kyZ2VTdmwOKpK3+rCPiX5xU4kTJAAqmiV4w6gMd6q7XEAY1Wju2M9NxAH0yHa+nnKg97R8ALyXL6SW7sRB2D4x3IDSoqoRCzbQuSDxXkiHNW0ii1d4Hxu8MHHXT8V+LZmemJwpN3PYzuycdrII0PokxziUAK3NHIXkZ7MSLYv560j5CwE4Q9pNI2teVExOtd1PNV4o6tNptxDgHIA/rjPfn7DZcHBtAiWm3k2k+VNy/s5GYewD0KmAfgNk6oW4oFX9cNMPGnohek21yRfQPnFn/vsBm68mo/qFmjRuNXcOptR+K+Uda7dkuQ3EeK6ASdkyyHI9McvC7dFfOyUzHBAnFGaw2cKCyklqWZjyct9iZ8PZvHNvhFCSk3j2au9B5M+k/3FgpKylp+aZJdiYJnALjhswaTbi44WMucEOvMCa/O8uASUy7nEzzkfJNU4ks2rpqhef+lRu+AXQg9jmAAfhfIyz7nIo/LCuLSoUfSbTPcnWtN4CC8BZAi4IR8RonlVAX/7fPSOGP5morgOZDh8PUnBt5tY328lZQT9euMTCOiNeVzEwFLnV5+1lWPp4aeyKIDRqhug0bTwpY9QGcyzK/z1RnxQjaq6pLVACt6po4XEhVW4RHqvdHrvpfAAz8FwbYtmegAAAAAElFTkSuQmCC";

const CloseCircleOutlinedBase =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAwxJREFUSEvFlj1oFEEUx/9v7vaqpJJYRAtFLolYKQiK+FVYGCEqaoQoiKCVEbQKt3PRjbnZI5XiR6VgowGjogY0hWAQBQOCVqLJ4QeY2EgKSVDYy+0zE+aSzbr3EZHzYJvbN+837z//93YIVfyy2ez6QqGwj4i2AlgBoNEs+wZggplfxGKxh6lU6m2ldFQuwHXdg8ycAdBcKZF5P0pEadu275WKjwT29vauFkL0A9hkFo4DeATgMRF99DxPV4ZEItHIzGsA7AGwF8BKEz/i+35Hd3f35zD4D6DrutuZ+T6AZQB04vPJZPJme3t7oVyVAwMDsVwudxxAj5F8kogO2Lb9PLhuEdDAngKwAAzG4/GjXV1dU1XKORfW19dXPzMzcwtAG4A8Ee0KQueBRsbXujIiuux53lnHcfylwIqxjuMIy7IuATg9+0z6vr+xKO88UCn1ypzZYD6f3/+3sBD0gal0REq5Wb+bAxo33tVnFo/HW5YqYykVjLwf9JkS0SHt3jmgUkr/qa1/Ukp5I5ggk8kcJqI2Ijpj2/b3qOSO49QlEoms7/sv0+n0nWCMUurEbO9eBzAqpWwh3dS+778BMJ5MJleF3aiUug2gY3aH7wDsDEM1zLKsJwD0UBiSUrYGgca9X3TLCCE2UCaT6SGicwCuSSk7wxW4rtsAYJiZ14WhIdhXIcSOVCr1KZxDKXUVwClmvkBKqWd65wBapZRDUZJFQT3P+xWorCTMHNluAFqFYQ0cBdBERM22bY+VMkAQCuA9gB/G1WVhxpRNzKw5YxqoG7sun8/XO44zXWG2NjCznhxrTdyEEGJblIzBPEZ6zZleEtAs1JOoOGNzRLSllHsDPamNpYFTVUsaMsgEgJ8AkqXcG6zQdd1FklY0TZQbmVnvONK9ES5dME2ltihn/XItE2r+hbao1Piu615hZt2fkW4MubdfSnmkbONXOdqOCSE6S7nRcZzllmVdZObBiqPtvwxvU2XtPk8aWPMPsJFW32dqc8UoOquml6gitKbXxNBIqs1FODya/uVV/zdoQRxOlxzf2AAAAABJRU5ErkJggg==";

const DownOutlinedBase =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAjtJREFUSEvt0z9ME2EYx/Hv2x4VokYYjA7GKB5XepUIbalRY2wUZzXRjUTDgkZXF511cjPRiZBojAPRxQE3B4wotBBreoXj1JAYo8QwGIyWtveYw8FGS/8AYVBufd/3+dzze59Xsc6fWmePDXDNE/8PI9V1fVNDw9ad2ezk7Gry1PWu7Y6jz8NQsbTOX5G2mZEBhbogSvXOZJIPV4IGzdgpQYZADdpWsr8iGDRjfYIMAD9AHbOt5Fg9qBHuOoD4ngNbEC7b2dSdiqC3GDSjdwUuAp9cTet20q8+1ILu3X9wR8AtjAnsRnHPzqTO/3mu7JQmEgnt49zCU5ATwGSjlj+aTqe/VUK9u/cHmp8JcgiRF27+63HHcXI1gd6mjo6Ollwx8BIwEPXYzibPArIcapix+yC9wGxRy8ffptNz5fZWfIft7XHD9RU9tAXUTdtKXi9XxDAj10DdABZ8LoenplJvlvuxqg+/LdTdo5Q7DGgK6Z22Jh6UFjNCkTMo9cjr3lVy2slMPKkUfVVwaYhC0Uui8KYt54oknOyE1zW6GevyISPAZoGrM1bqVrXhqgn0ihhm5DaoK8DnAsQb8S0WcMeBXQo1OG0l+6ph3nrNIJzzG+F3wwgngddet0AcGNH43mNZ1uIag7Cns7M5sOj34gwuFVe8J0/ctlNfasHq7PBXyX3hiO4XNQo0uPiOONZ4plZsRaB3qLU1uq2pKeDPZEbn68FWDNaLlO6vY2hWw/w+uwGuTY4lVf79SH8CgPO2HR8TRF4AAAAASUVORK5CYII=";

const UpDownCircleOutlinedBase =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAr1JREFUSEu9lm1IU2EUx//P3Z1KWFFCL46SFlRUFM5sCr3gh15YYDXdjCKKPqRFkpD1SQLDiCAW9U1rfaiQcC+EVFKWIhEqQRMMamnZl8kSrMQtXJt74j7e2d7u7mXFfT4N7jnnt/N/zjnPIVBwtEecxZRyh0CxE4AOQKHoNg7AB4LXhEQfhx9Ve+TCkUwGGourmhDSAmC9XCDxu5dS2jTrqHJK2acF5lk610RIpB1AmUJQstkAT/mjM47KseQPKUDe4t4NAheAgixhMbdJUFRFHOa++DgJQBHWDUCbCXbt2GZ8+RbEnZcpCSS7hUGxJx46DxRlfCuXWcHCHPjvHsD4jxkU1XUpEWGSp3xpTN55IG919yu5s2WLc+FrM2FiKgTd6WdKgILNQKTDXC78YECxGh1KvLMEglJqEaqXAXmr+6PS0s8WCMAb6TBvIKypo9w7JdkJNv8ABOGiBsLXuJtBcVkNIAiuEN7q7gFQoQoQ6BWAXgDrVAJ+EoDTAPJVAgbUBk5nlHTTqkW4fWorbnSOoMvjZyJIVWndXj0OGwtRYxvEz2BYSjAmqWTRVG5bCdfFMoTCURy83o9XwxNpgWf26dkfi1KKjQ3d+OwPSgF7ZdvCdmIL6k1rEQzNwnT1DUb9gYTRdnzXatjPloAQoLbVg3s9X6XLQWgLucYXArXVGnCyoghTv8Kw2gbxvGkHm6X19iG0N2yHhiNovD+MW09HM9Yea3wlo40jBA/Pl8JSrsP3wG8szc9h97QgV4McnkOz4wNanMJ0zHjmRpvS4a3VcHA2GmEyrGBRKQWT8eaTEVx68F4Olji8xSxln6c8rQaOC0bsL17OAK0vxnDOPiQLS3meBA+lD7BgW6JfgkAoAq9PmBmyJ/0DzLKc22dkVwxZxF8D6RUjZqPqEhWDqromxsul2iKcfEf/c9X/A0ILY/dsxoOPAAAAAElFTkSuQmCC";

export {
  SearchOutlinedBase,
  DeleteOutlinedBase,
  QuestionCircleOutlinedBase,
  ArrowCircleDownOutlinedBase,
  CloseCircleOutlinedBase,
  DownOutlinedBase,
  UpDownCircleOutlinedBase,
};
