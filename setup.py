from setuptools import setup, find_packages

setup(
    name="gazer_custom",
    version="0.0.1",
    description="Custom UI enhancements for Gazer CRM",
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    python_requires=">=3.10",
)
